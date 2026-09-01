<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title ?? 'PASSAGE', ENT_QUOTES, 'UTF-8') ?></title>
  <link rel="stylesheet" href="/assets/css/passage-theme.css">
  <style>
    body { margin: 0; min-height: 100vh; background: var(--surface); color: var(--ink); font: 16px/1.5 Arial, sans-serif; }
    main { max-width: 760px; margin: 0 auto; padding: 64px 24px; }
    h1 { color: var(--green); margin: 0 0 8px; }
    code { background: var(--green-50); padding: 2px 5px; border-radius: 4px; }
    a { color: var(--green-700); }
  </style>
</head>
<body>
  <main><?= $content ?></main>
</body>
</html>
