<?php
/**
 * ClearPath crossing status API endpoint — deploy on ce-prod.
 *
 * Place at a path on the server, e.g.:
 *   /var/www/vhosts/champlinenterprises.com/crm.ChamplinEnterprises.com/clearpath-status.php
 *
 * All database credentials come from server environment variables set in Plesk.
 * See worker/README.md for deployment instructions.
 * NEVER commit a .env or credentials to this file.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://clearpath.champlinenterprises.com');

// Load from worker .env on the same server (not in webroot — secure).
// Uses a simple line parser to handle values containing '=' (e.g. URLs with query strings).
$wenv = [];
$wenv_path = '/var/www/vhosts/champlinenterprises.com/clearpath-worker/.env';
if (file_exists($wenv_path)) {
    foreach (file($wenv_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if ($line[0] === '#') continue;
        $eq = strpos($line, '=');
        if ($eq !== false) {
            $wenv[substr($line, 0, $eq)] = substr($line, $eq + 1);
        }
    }
}

$cfg = [
    'host' => getenv('CLEARPATH_DB_HOST') ?: ($wenv['DB_HOST'] ?? '127.0.0.1'),
    'name' => getenv('CLEARPATH_DB_NAME') ?: ($wenv['DB_NAME'] ?? ''),
    'user' => getenv('CLEARPATH_DB_USER') ?: ($wenv['DB_USER'] ?? ''),
    'auth' => getenv('CLEARPATH_DB_AUTH') ?: ($wenv['DB_AUTH'] ?? ''),
];

if (!$cfg['name'] || !$cfg['user']) {
    http_response_code(503);
    echo json_encode(['error' => 'DB not configured — check server env vars']);
    exit;
}

try {
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['auth'], [
        PDO::ATTR_ERRMODE  => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT  => 3,
    ]);

    $rows = $pdo
        ->query('SELECT crossing_id, state, confidence, blocked_since, updated_at
                 FROM crossing_status ORDER BY crossing_id')
        ->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['confidence'] = (float) $row['confidence'];
    }

    echo json_encode($rows, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(502);
    echo json_encode(['error' => 'DB unavailable']);
}
