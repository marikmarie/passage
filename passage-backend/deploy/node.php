<?php
/**
 * PASSAGE PHP -> Node bridge.
 *
 * Upload to the server as: /passageApi/node.php
 *
 * Apache on this host cannot execute the Express app, but the host does have a
 * usable `node` binary. This script turns each incoming HTTP request into a
 * one-shot Node invocation:
 *
 *   PHP  --(JSON envelope on stdin)-->  node dist/index.js --cli-json
 *   PHP  <--(JSON envelope on stdout)-- node
 *
 * Node's CLI mode (src/index.ts) binds an ephemeral loopback port, serves the
 * single request, and exits. It never binds 0.0.0.0, which is what produced the
 * EACCES error when index.js was run bare.
 *
 * KNOWN LIMITS OF THIS APPROACH - see deploy/README-php-bridge.md:
 *   - One Node process + one MySQL connect per request (slow: ~300-800ms).
 *   - Socket.IO / WebSocket live tracking cannot work. Use polling.
 *   - node-cron scheduled jobs never run. Register a real cron job instead.
 *   - The in-memory rate limiter resets every request and enforces nothing.
 */

// --------------------------------------------------------------------------
// Configuration. Override NODE_BIN here if auto-detection fails.
// --------------------------------------------------------------------------
$NODE_BIN_OVERRIDE = getenv('PASSAGE_NODE_BIN') ?: '';
$EXEC_TIMEOUT_SECONDS = 30;

// Preferred layout keeps the build in dist/ so that dotenv's `../../.env`
// lookup resolves to /passageApi/.env. Falls back to a flattened upload.
$APP_ENTRY = __DIR__ . '/dist/index.js';
if (!is_file($APP_ENTRY)) {
    $APP_ENTRY = __DIR__ . '/index.js';
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function bridge_fail($status, $message, $detail = null)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    $payload = array('success' => false, 'message' => $message);
    if ($detail !== null && $detail !== '') {
        $payload['detail'] = $detail;
    }
    echo json_encode($payload);
    exit;
}

function find_node_binary($override)
{
    if ($override !== '' && is_executable($override)) {
        return $override;
    }

    $candidates = array();

    // `which` is the most reliable source when it is not disabled.
    if (function_exists('shell_exec')) {
        $which = @shell_exec('command -v node 2>/dev/null');
        if (is_string($which) && trim($which) !== '') {
            $candidates[] = trim($which);
        }
    }

    $candidates[] = '/usr/local/bin/node';
    $candidates[] = '/usr/bin/node';
    $candidates[] = '/opt/cpanel/ea-nodejs22/bin/node';
    $candidates[] = '/opt/cpanel/ea-nodejs20/bin/node';
    $candidates[] = '/opt/cpanel/ea-nodejs18/bin/node';

    // CloudLinux alt-node installs, newest first.
    $altRoots = glob('/opt/alt/alt-nodejs*/root/usr/bin/node');
    if (is_array($altRoots)) {
        rsort($altRoots);
        foreach ($altRoots as $alt) {
            $candidates[] = $alt;
        }
    }

    foreach ($candidates as $candidate) {
        if ($candidate !== '' && is_executable($candidate)) {
            return $candidate;
        }
    }

    return null;
}

function collect_request_headers()
{
    $headers = array();

    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            $headers[strtolower($name)] = $value;
        }
    }

    // Fallback / supplement from $_SERVER, which also survives when
    // getallheaders() is unavailable under CGI.
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $name = strtolower(str_replace('_', '-', substr($key, 5)));
            if (!isset($headers[$name])) {
                $headers[$name] = $value;
            }
        }
    }

    if (isset($_SERVER['CONTENT_TYPE'])) {
        $headers['content-type'] = $_SERVER['CONTENT_TYPE'];
    }

    // Apache frequently strips Authorization before PHP sees it. The .htaccess
    // shipped alongside this file republishes it as REDIRECT_HTTP_AUTHORIZATION.
    if (!isset($headers['authorization'])) {
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers['authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        }
    }

    // These describe the PHP hop, not the internal request.
    unset($headers['host'], $headers['connection'], $headers['content-length'], $headers['accept-encoding']);

    return $headers;
}

/**
 * Recover the application path from the rewritten request.
 * /passageApi/api/v1/health  ->  /api/v1/health
 */
function resolve_app_path()
{
    $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';

    $query = '';
    $questionMark = strpos($uri, '?');
    if ($questionMark !== false) {
        $query = substr($uri, $questionMark);
        $uri = substr($uri, 0, $questionMark);
    }

    $scriptName = isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '';
    $base = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');

    if ($base !== '' && $base !== '.' && strpos($uri, $base) === 0) {
        $uri = substr($uri, strlen($base));
    }

    // Supports the no-rewrite fallback form: /passageApi/node.php/api/v1/health
    if (strpos($uri, '/node.php') === 0) {
        $uri = substr($uri, strlen('/node.php'));
    }

    if ($uri === '' || $uri === false) {
        $uri = '/';
    }

    return $uri . $query;
}

// --------------------------------------------------------------------------
// Preconditions
// --------------------------------------------------------------------------

if (!function_exists('proc_open')) {
    bridge_fail(500, 'The bridge requires proc_open(), which this host has disabled.', 'Ask the host to remove proc_open from disable_functions in php.ini.');
}

if (!is_file($APP_ENTRY)) {
    bridge_fail(500, 'Backend entry point not found.', 'Expected dist/index.js or index.js next to node.php.');
}

$nodeBin = find_node_binary($NODE_BIN_OVERRIDE);
if ($nodeBin === null) {
    bridge_fail(500, 'No usable node binary was found on this host.', 'Set PASSAGE_NODE_BIN or edit $NODE_BIN_OVERRIDE in node.php.');
}

// --------------------------------------------------------------------------
// CORS preflight is answered here rather than paying for a Node spawn.
// This mirrors the unconditional `app.use(cors())` in src/config/app.ts.
// If that policy is ever tightened, tighten it here too.
// --------------------------------------------------------------------------
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    $requested = isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])
        ? $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']
        : 'Content-Type, Authorization';
    header('Access-Control-Allow-Headers: ' . $requested);
    header('Access-Control-Max-Age: 600');
    http_response_code(204);
    exit;
}

// --------------------------------------------------------------------------
// Build the envelope and invoke Node.
// --------------------------------------------------------------------------

$envelope = json_encode(array(
    'method'  => isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET',
    'path'    => resolve_app_path(),
    'headers' => collect_request_headers(),
    'body'    => file_get_contents('php://input'),
));

$descriptors = array(
    0 => array('pipe', 'r'),
    1 => array('pipe', 'w'),
    2 => array('pipe', 'w'),
);

// The envelope travels on stdin, never argv: argv is world-readable via `ps`
// on shared hosting and would leak bearer tokens and request bodies.
$command = escapeshellarg($nodeBin) . ' ' . escapeshellarg($APP_ENTRY) . ' --cli-json';

$process = proc_open($command, $descriptors, $pipes, dirname($APP_ENTRY), null);
if (!is_resource($process)) {
    bridge_fail(502, 'Unable to start the backend process.');
}

fwrite($pipes[0], $envelope);
fclose($pipes[0]);

stream_set_blocking($pipes[1], false);
stream_set_blocking($pipes[2], false);

$stdout = '';
$stderr = '';
$deadline = time() + $EXEC_TIMEOUT_SECONDS;
$timedOut = false;

while (true) {
    $status = proc_get_status($process);

    $stdout .= stream_get_contents($pipes[1]);
    $stderr .= stream_get_contents($pipes[2]);

    if (!$status['running']) {
        break;
    }

    if (time() > $deadline) {
        $timedOut = true;
        proc_terminate($process, 9);
        break;
    }

    usleep(10000);
}

// Drain whatever landed between the final read and process exit.
$stdout .= stream_get_contents($pipes[1]);
$stderr .= stream_get_contents($pipes[2]);

fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);

if ($timedOut) {
    bridge_fail(504, 'The backend did not respond in time.', 'Exceeded ' . $EXEC_TIMEOUT_SECONDS . 's. A stalled database connection is the usual cause.');
}

$decoded = json_decode($stdout, true);
if (!is_array($decoded) || !isset($decoded['status'])) {
    // stderr carries the real reason (missing module, DB failure, syntax error).
    bridge_fail(502, 'The backend returned an unreadable response.', trim($stderr) !== '' ? trim($stderr) : trim($stdout));
}

http_response_code((int) $decoded['status']);

if (isset($decoded['headers']) && is_array($decoded['headers'])) {
    foreach ($decoded['headers'] as $name => $value) {
        $lower = strtolower($name);
        if ($lower === 'content-length' || $lower === 'transfer-encoding' || $lower === 'connection') {
            continue;
        }
        header($name . ': ' . $value, $lower !== 'set-cookie');
    }
}

echo isset($decoded['body']) ? $decoded['body'] : '';
