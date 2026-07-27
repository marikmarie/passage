/**
 * Must be imported before anything else in src/index.ts.
 *
 * In `--cli-json` mode stdout is a machine channel: deploy/node.php parses it
 * as a single JSON response envelope. Any stray console.log anywhere in the
 * app - or in a dependency - would prepend text and make the whole response
 * unparseable, surfacing to the client as an opaque 502.
 *
 * Diagnostics are not lost; they are rerouted to stderr, which the bridge
 * reports when a request fails.
 */
if (process.argv.includes('--cli-json')) {
  const toStderr = (...args: unknown[]) => {
    process.stderr.write(
      args
        .map((arg) => (typeof arg === 'string' ? arg : require('util').inspect(arg)))
        .join(' ') + '\n',
    );
  };

  console.log = toStderr;
  console.info = toStderr;
  console.debug = toStderr;
  console.warn = toStderr;
}
