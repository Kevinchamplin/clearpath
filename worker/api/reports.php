<?php
/**
 * ClearPath community blockage reports API — deploy on ce-prod.
 *
 * Place at:
 *   /var/www/vhosts/champlinenterprises.com/crm.ChamplinEnterprises.com/clearpath-reports.php
 *
 * POST — insert a new report
 * GET  — return recent reports (last 48 h, newest first, max 100)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://clearpath.champlinenterprises.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- DB credentials (same .env as freight worker) ---
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
    echo json_encode(['error' => 'DB not configured']);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host={$cfg['host']};dbname={$cfg['name']};charset=utf8mb4",
        $cfg['user'],
        $cfg['auth'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 3]
    );
} catch (PDOException $e) {
    http_response_code(502);
    echo json_encode(['error' => 'DB unavailable']);
    exit;
}

// --- POST: insert report ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $crossing_id    = trim((string) ($body['crossing'] ?? ''));
    $railroad       = trim((string) ($body['railroad'] ?? 'BNSF'));
    $reported_at    = trim((string) ($body['reported_at'] ?? ''));
    $duration       = isset($body['duration_minutes']) ? (int) $body['duration_minutes'] : null;
    $description    = substr(trim((string) ($body['description'] ?? '')), 0, 1000);
    $reporter_name  = substr(trim((string) ($body['reporter_name'] ?? '')), 0, 100);

    if (!$crossing_id || !$reported_at) {
        http_response_code(422);
        echo json_encode(['error' => 'Missing required fields: crossing, reported_at']);
        exit;
    }

    // Validate reported_at is a parseable datetime
    $dt = DateTime::createFromFormat('Y-m-d\TH:i', $reported_at)
       ?: DateTime::createFromFormat('Y-m-d H:i:s', $reported_at)
       ?: DateTime::createFromFormat(DateTime::ATOM, $reported_at);

    if (!$dt) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid reported_at format']);
        exit;
    }

    $stmt = $pdo->prepare('
        INSERT INTO community_reports (crossing_id, railroad, reported_at, duration_minutes, description, reporter_name)
        VALUES (:crossing_id, :railroad, :reported_at, :duration, :description, :reporter_name)
    ');
    $stmt->execute([
        ':crossing_id'   => $crossing_id,
        ':railroad'      => $railroad,
        ':reported_at'   => $dt->format('Y-m-d H:i:s'),
        ':duration'      => $duration,
        ':description'   => $description,
        ':reporter_name' => $reporter_name,
    ]);

    $id = $pdo->lastInsertId();
    http_response_code(201);
    echo json_encode(['id' => (int) $id, 'crossing_id' => $crossing_id, 'submitted' => true]);
    exit;
}

// --- GET: recent reports ---
$rows = $pdo->query("
    SELECT id, crossing_id, railroad, reported_at, duration_minutes, description, reporter_name, created_at
    FROM community_reports
    WHERE reported_at >= NOW() - INTERVAL 48 HOUR
    ORDER BY reported_at DESC
    LIMIT 100
")->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as &$row) {
    $row['id']               = (int) $row['id'];
    $row['duration_minutes'] = $row['duration_minutes'] !== null ? (int) $row['duration_minutes'] : null;
}

echo json_encode($rows, JSON_UNESCAPED_UNICODE);
