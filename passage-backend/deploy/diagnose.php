<?php
/**
 * Upload to the server as: /passageApi/diagnose.php
 * Visit https://mariam.cissytech.com/passageApi/diagnose.php?key=CHANGE_ME
 *
 * Reports everything the bridge depends on. DELETE THIS FILE once the bridge
 * works - it discloses paths and PHP configuration.
 */

$ACCESS_KEY = 'CHANGE_ME';

if (!isset($_GET['key']) || !hash_equals($ACCESS_KEY, $_GET['key'])) {
    http_response_code(404);
    exit;
}

header('Content-Type: text/plain; charset=utf-8');

function line($label, $value)
{
    echo str_pad($label, 34) . ': ' . $value . "\n";
}

echo "PASSAGE PHP -> Node bridge diagnostics\n";
echo str_repeat('=', 60) . "\n\n";

line('PHP version', PHP_VERSION);
line('proc_open available', function_exists('proc_open') ? 'yes' : 'NO - bridge cannot work');
line('shell_exec available', function_exists('shell_exec') ? 'yes' : 'no (auto-detect degraded)');
line('disable_functions', ini_get('disable_functions') ?: '(none)');
line('script dir', __DIR__);
line('document root', isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : '?');

echo "\nFilesystem layout\n" . str_repeat('-', 60) . "\n";
foreach (array('dist/index.js', 'index.js', 'node_modules', 'package.json', '.env', 'dist/config/env.js') as $rel) {
    $path = __DIR__ . '/' . $rel;
    line($rel, file_exists($path) ? 'present' : 'MISSING');
}

echo "\nNode binary discovery\n" . str_repeat('-', 60) . "\n";
$candidates = array();
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
$alt = glob('/opt/alt/alt-nodejs*/root/usr/bin/node');
if (is_array($alt)) {
    rsort($alt);
    $candidates = array_merge($candidates, $alt);
}

$nodeBin = null;
foreach ($candidates as $candidate) {
    $ok = is_executable($candidate);
    line($candidate, $ok ? 'EXECUTABLE' : 'no');
    if ($ok && $nodeBin === null) {
        $nodeBin = $candidate;
    }
}

if ($nodeBin === null) {
    echo "\nNo node binary found. Stop here and ask the host for its path.\n";
    exit;
}

echo "\nLive Node check\n" . str_repeat('-', 60) . "\n";
line('using', $nodeBin);

function run_node($bin, $args, $stdin, $cwd)
{
    $descriptors = array(
        0 => array('pipe', 'r'),
        1 => array('pipe', 'w'),
        2 => array('pipe', 'w'),
    );
    $process = proc_open(escapeshellarg($bin) . ' ' . $args, $descriptors, $pipes, $cwd, null);
    if (!is_resource($process)) {
        return array('out' => '', 'err' => 'proc_open failed', 'code' => -1);
    }
    fwrite($pipes[0], $stdin);
    fclose($pipes[0]);
    $out = stream_get_contents($pipes[1]);
    $err = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    return array('out' => $out, 'err' => $err, 'code' => proc_close($process));
}

$version = run_node($nodeBin, '-v', '', __DIR__);
line('node -v', trim($version['out']) ?: trim($version['err']));

// Can this account bind an ephemeral loopback port? The bridge depends on it.
$bindProbe = <<<'JS'
const net = require('net');
const s = net.createServer();
s.once('error', (e) => { console.log('BIND_FAIL ' + e.code); process.exit(0); });
s.listen(0, '127.0.0.1', () => { console.log('BIND_OK ' + s.address().port); s.close(); });
JS;
$probe = run_node($nodeBin, '-e ' . escapeshellarg($bindProbe), '', __DIR__);
line('loopback bind probe', trim($probe['out']) ?: trim($probe['err']));

$entry = is_file(__DIR__ . '/dist/index.js') ? __DIR__ . '/dist/index.js' : __DIR__ . '/index.js';
if (is_file($entry)) {
    echo "\nEnd-to-end health call\n" . str_repeat('-', 60) . "\n";
    line('entry', $entry);
    $envelope = json_encode(array(
        'method' => 'GET',
        'path' => '/api/v1/health',
        'headers' => array('accept' => 'application/json'),
        'body' => '',
    ));
    $result = run_node($nodeBin, escapeshellarg($entry) . ' --cli-json', $envelope, dirname($entry));
    echo "exit code : " . $result['code'] . "\n";
    echo "stdout    : " . trim($result['out']) . "\n";
    echo "stderr    : " . trim($result['err']) . "\n";
}
