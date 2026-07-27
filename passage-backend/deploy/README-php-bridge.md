# Deploying PASSAGE behind the PHP → Node bridge

The host (`mariam.cissytech.com`) runs Apache with PHP and **cannot run a
long-lived Node server**, but it does have a working `node` binary. This
directory contains a bridge that serves the existing Express app anyway, one
process per request.

```
Browser ──HTTP──▶ Apache ──▶ node.php ──stdin(JSON)──▶ node dist/index.js --cli-json
                                     ◀──stdout(JSON)──
```

Node's `--cli-json` mode binds an **ephemeral loopback port**, serves exactly one
request, and exits. Running `index.js` bare instead tries to bind `0.0.0.0:8080`,
which shared hosting refuses — that is the `EACCES` error `node.php` was
returning.

## Why the old setup returned 404

The compiled `dist/` output was uploaded directly into `/passageApi/`. Apache has
no reason to execute `.js`, so it served the files as **static text** (the whole
backend source was publicly downloadable) and returned Apache's "Object not
found!" page for `/passageApi/api/v1/health`, because no such file existed on
disk. Node was never involved.

## Required server layout

Upload this exact structure. `dist/` must stay a subdirectory — `config/env.js`
resolves `.env` via `../../.env`, so flattening the build puts `.env` outside the
app folder.

```
/passageApi/
├── .htaccess          ← deploy/passageApi.htaccess
├── node.php           ← deploy/node.php
├── .env               ← real secrets, never committed
├── package.json
├── node_modules/      ← production dependencies
└── dist/              ← output of `npm run build`
    ├── index.js
    ├── config/
    └── ...
```

## Steps

1. **Build locally**

   ```bash
   cd passage_backend/passage-backend
   npm run build
   ```

2. **Get production dependencies.** The current `/passageApi/` upload has no
   `node_modules` or `package.json` at all. Either upload your local
   `node_modules` (large but works) or, if you have SSH, run `npm ci --omit=dev`
   on the server.

3. **Upload via WinSCP** into `/passageApi/`:
   - `deploy/node.php` → `/passageApi/node.php`
   - `deploy/passageApi.htaccess` → `/passageApi/.htaccess` (note the rename)
   - `dist/` → `/passageApi/dist/`
   - `package.json`, `node_modules/`, `.env`

4. **Delete the old flattened upload** — the loose `index.js`, `server.js`,
   `config/`, `modules/` etc. sitting directly in `/passageApi/`. They are stale
   and were publicly readable.

5. **Verify**

   ```bash
   curl -i https://mariam.cissytech.com/passageApi/api/v1/health
   ```

   Expect `platform: "PASSAGE"`. If you see `platform: "EduTechMoney"` you have
   hit the unrelated PHP app at the domain root, not this deployment.

## If it fails

Upload `deploy/diagnose.php`, set `$ACCESS_KEY` to something private, and open
`/passageApi/diagnose.php?key=YOURKEY`. It reports the PHP version,
`disable_functions`, node binary discovery, whether an ephemeral loopback bind is
permitted, and a live end-to-end health call. **Delete it afterwards.**

Common causes:

| Symptom | Cause |
| --- | --- |
| `proc_open() disabled` | Host blocks process spawning. The bridge cannot work; ask them to allow it. |
| `BIND_FAIL EACCES` in the probe | Host blocks even loopback binds. The bridge cannot work. |
| 502 with `Cannot find module 'express'` | `node_modules` missing or in the wrong directory. |
| 404 from Apache, not JSON | `.htaccess` not uploaded, or `mod_rewrite` off. Fallback URL form: `/passageApi/node.php/api/v1/health`. |
| `Access denied for user 'passagem_app'` | The pre-existing MySQL credentials blocker, unrelated to the bridge. |

## Limits you are accepting

These are inherent to one-process-per-request, not bugs to fix later:

- **Latency.** Every request pays Node startup plus a fresh MySQL handshake,
  roughly 300–800 ms. Acceptable for testing, poor for production.
- **No WebSockets.** `setupSocketIO` never runs. Phase 7 live journey tracking
  must use HTTP polling on this host.
- **No scheduled jobs.** `initializeJobs()` never runs. Move anything in
  `src/jobs/` to a real cron entry that invokes
  `node /path/to/passageApi/dist/index.js <route>`.
- **Rate limiting is inert.** `rateLimiter` keeps state in a module-level object
  that dies with the process, so it enforces nothing here. Do not rely on it.

If any of these matter for launch, the bridge is a stopgap — the app belongs on a
host that runs Node directly.

## Separate pre-existing issue

Error responses currently leak raw MySQL messages to clients, e.g.
`Access denied for user 'passagem_app'@'154.227.131.231'`. That exposes the
database user and server IP. Worth fixing in `errorHandler.middleware.ts` before
this is public, independently of the bridge.
