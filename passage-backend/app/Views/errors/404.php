<?php
ob_start();
?>
<h1>Page not found</h1>
<p><?= htmlspecialchars($path ?? '', ENT_QUOTES, 'UTF-8') ?> does not exist.</p>
<p><a href="/">Return to PASSAGE</a></p>
<?php
$content = ob_get_clean();
$title = 'Not Found';
require dirname(__DIR__) . '/layouts/base.php';
