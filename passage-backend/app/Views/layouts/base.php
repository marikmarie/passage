<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title ?? 'PASSAGE', ENT_QUOTES, 'UTF-8') ?></title>
  <style>
    :root { color-scheme: light; --green: #00bf63; --ink: #20283c; --muted: #5f6688; --surface: #f5f7fa; }
    body { margin: 0; min-height: 100vh; background: var(--surface); color: var(--ink); font: 16px/1.5 Arial, sans-serif; }
    main { max-width: 760px; margin: 0 auto; padding: 64px 24px; }
    h1 { color: var(--green); margin: 0 0 8px; }
    code { background: #e7f8ef; padding: 2px 5px; border-radius: 4px; }
    a { color: #087e45; }
  </style>
</head>
<body>
  <main><?= $content ?></main>
</body>
</html>
