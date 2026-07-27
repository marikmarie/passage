const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('CLI entrypoint returns a JSON health response', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const result = spawnSync(process.execPath, ['dist/index.js', 'api', 'v1', 'health'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /"status"\s*:\s*"healthy"/);
});
