<?php
ob_start();
?>
<h1>PASSAGE API</h1>
<p>The plain-PHP MVC backend is running.</p>
<p>Check <a href="/api/v1/health"><code>/api/v1/health</code></a> or open the <a href="/admin">admin dashboard</a>.</p>
<?php
$content = ob_get_clean();
$title = 'PASSAGE API';
require dirname(__DIR__) . '/layouts/base.php';
