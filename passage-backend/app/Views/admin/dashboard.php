<?php

declare(strict_types=1);

require __DIR__ . '/components/shell-head.php';
?>
<body>
<?php require __DIR__ . '/components/shell-sidebar.php'; ?>
<?php require __DIR__ . '/components/shell-layout-open.php'; ?>
<?php require __DIR__ . '/components/shell-topbar.php'; ?>
<?php require __DIR__ . '/components/shell-content.php'; ?>
<?php require __DIR__ . '/components/shell-modal.php'; ?>
<div id="toast-container" aria-live="polite"></div>
<script src="/assets/admin/js/admin-api.js" defer></script>
<script src="/assets/admin/js/admin-shell.js" defer></script>
</body>
</html>
