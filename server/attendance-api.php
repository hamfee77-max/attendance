<?php
/**
 * Student Attendance app — data-centre server (college or any other data centre)
 * ------------------------------------------------------------------------------
 * Same protocol as the Google Drive server (server/Code.gs), for an institution's own web server.
 * Requirements: PHP 7.4+ with pdo_sqlite (or sqlite3) and openssl/curl, served over HTTPS.
 * Install (IT team):
 *   1. Copy this file to the web server, e.g. https://data.example.edu.iq/attendance/attendance-api.php
 *   2. Set DATA_DIR below to a folder the web server can write to, preferably OUTSIDE the public web root.
 *   3. Open the file's address in a browser: it must answer {"ok":true,...}.
 *   4. Give the address to the app's system administrator (Department setup → Report storage).
 * Stored data (in DATA_DIR):
 *   attendance.sqlite                 lectures (newest version per lecture), submissions log, reports log
 *   backups/<year>/<sender>/*.json     a backup copy of every submission
 *   reports/<year>/...                 archived official reports (HTML / CSV)
 */
define('DEPT_URL', getenv('ATTENDANCE_DEPT_URL') ?: 'https://hamfee77-max.github.io/attendance/js/department.js');
define('DATA_DIR', getenv('ATTENDANCE_DATA_DIR') ?: __DIR__ . '/attendance-data');   // better: a private folder outside the web root
const EDIT_WINDOW_HOURS = 72;
const TIMEZONE = 'Asia/Baghdad';

date_default_timezone_set(TIMEZONE);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { exit; }
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') { out(['ok' => true, 'service' => 'attendance-datacentre', 'time' => now()]); }

try {
    $req = json_decode(file_get_contents('php://input'), true);
    if (!is_array($req)) throw new Exception('bad request');
    $acc = authenticate($req['account'] ?? '', $req['key'] ?? '');
    if (!$acc) out(['ok' => false, 'error' => 'auth']);
    switch ($req['action'] ?? '') {
        case 'ping': out(['ok' => true, 'name' => $acc['name'], 'role' => $acc['role'], 'time' => now()]);
        case 'submit': out(submit($acc, $req));
        case 'pull': out(pull($acc, $req));
        case 'archive': out(archive($acc, $req));
    }
    out(['ok' => false, 'error' => 'action']);
} catch (Throwable $e) {
    out(['ok' => false, 'error' => $e->getMessage()]);
}

// ---------------------------------------------------------------- helpers
function out($o) { echo json_encode($o, JSON_UNESCAPED_UNICODE); exit; }
function now() { return (int) round(microtime(true) * 1000); }
function dir_of(array $parts) {
    $p = DATA_DIR;
    foreach ($parts as $x) { $p .= '/' . preg_replace('/[\\\\\/:*?"<>|\x00-\x1f]+/u', '_', (string) $x); }
    if (!is_dir($p) && !mkdir($p, 0770, true) && !is_dir($p)) throw new Exception('cannot create folder');
    return $p;
}
function db() {
    static $pdo = null;
    if ($pdo) return $pdo;
    dir_of([]);
    if (!file_exists(DATA_DIR . '/.htaccess')) @file_put_contents(DATA_DIR . '/.htaccess', "Require all denied\nDeny from all\n");
    $pdo = new PDO('sqlite:' . DATA_DIR . '/attendance.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, courseId TEXT, date TEXT, updatedAt INTEGER, firstReceived INTEGER, lastReceived INTEGER, sentBy TEXT, json TEXT)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS sessions_received ON sessions(lastReceived)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS submissions (at INTEGER, account TEXT, name TEXT, role TEXT, lectures INTEGER, absences INTEGER, rejected INTEGER, backup TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS reports (at INTEGER, account TEXT, name TEXT, files TEXT)');
    return $pdo;
}

// ---------------------------------------------------------------- accounts from the published department file
function dept() {
    $cache = DATA_DIR . '/dept-cache.json';
    if (is_file($cache) && time() - filemtime($cache) < 600) { $j = json_decode(file_get_contents($cache), true); if ($j) return $j; }
    $ctx = stream_context_create(['http' => ['timeout' => 15, 'header' => "Cache-Control: no-cache\r\n"]]);
    $txt = @file_get_contents(DEPT_URL . '?t=' . time(), false, $ctx);
    if ($txt === false && function_exists('curl_init')) {
        $c = curl_init(DEPT_URL . '?t=' . time()); curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_FOLLOWLOCATION => true]);
        $txt = curl_exec($c); curl_close($c);
    }
    if (!$txt) { if (is_file($cache)) return json_decode(file_get_contents($cache), true); throw new Exception('department file unavailable'); }
    $j = json_decode(substr($txt, strpos($txt, '{'), strrpos($txt, '}') - strpos($txt, '{') + 1), true);
    if (!$j) throw new Exception('department file unreadable');
    $slim = ['accounts' => [], 'editWindowHours' => (float) ($j['config']['rules']['editWindowHours'] ?? EDIT_WINDOW_HOURS)];
    foreach ($j['accounts'] ?? [] as $a) $slim['accounts'][] = ['id' => $a['id'], 'name' => $a['name'], 'role' => $a['role'] ?? 'lecturer', 'courses' => $a['courses'] ?? [], 'keyHash' => $a['keyHash'] ?? ''];
    dir_of([]); @file_put_contents($cache, json_encode($slim, JSON_UNESCAPED_UNICODE));
    return $slim;
}
function authenticate($id, $key) {
    if (!$id || !$key) return null;
    foreach (dept()['accounts'] as $a) {
        if ($a['id'] !== $id) continue;
        if (!$a['keyHash'] || !hash_equals($a['keyHash'], hash('sha256', (string) $key))) return null;
        $a['role'] = $a['role'] === 'master' ? 'admin' : ($a['role'] === 'committee' ? 'head' : $a['role']);
        return $a;
    }
    return null;
}

// ---------------------------------------------------------------- actions
function submit(array $acc, array $req) {
    $pdo = db(); $now = now(); $windowMs = dept()['editWindowHours'] * 3600000;
    $latest = [];
    foreach ($req['sessions'] ?? [] as $s) if (is_array($s) && !empty($s['id'])) $latest[$s['id']] = $s;
    $accepted = []; $rejected = []; $absences = 0;
    $pdo->beginTransaction();
    $get = $pdo->prepare('SELECT updatedAt, firstReceived FROM sessions WHERE id = ?');
    $ins = $pdo->prepare('INSERT INTO sessions (id, courseId, date, updatedAt, firstReceived, lastReceived, sentBy, json) VALUES (?,?,?,?,?,?,?,?)');
    $upd = $pdo->prepare('UPDATE sessions SET courseId=?, date=?, updatedAt=?, lastReceived=?, sentBy=?, json=? WHERE id=?');
    foreach ($latest as $s) {
        if (empty($s['courseId'])) continue;
        if ($acc['role'] === 'lecturer' && !in_array($s['courseId'], $acc['courses'], true)) { $rejected[] = ['id' => $s['id'], 'why' => 'course']; continue; }
        foreach ($s['records'] ?? [] as $v) if ($v === 'A' || $v === 'E') $absences++;
        $get->execute([$s['id']]); $row = $get->fetch(PDO::FETCH_ASSOC);
        $upAt = (int) ($s['updatedAt'] ?? $now);
        if ($row) {
            if ($acc['role'] === 'lecturer' && $now - (int) $row['firstReceived'] > $windowMs) { $rejected[] = ['id' => $s['id'], 'why' => 'locked']; continue; }
            if ($upAt > (int) $row['updatedAt']) $upd->execute([$s['courseId'], $s['date'] ?? '', $upAt, $now, $acc['name'], json_encode($s, JSON_UNESCAPED_UNICODE), $s['id']]);
        } else {
            $ins->execute([$s['id'], $s['courseId'], $s['date'] ?? '', $upAt, $now, $now, $acc['name'], json_encode($s, JSON_UNESCAPED_UNICODE)]);
        }
        $accepted[] = $s['id'];
    }
    $backup = '';
    if ($latest) {
        $f = dir_of(['backups', $req['yearId'] ?? 'year', $acc['name']]) . '/' . date('Y-m-d H-i-s') . '.json';
        file_put_contents($f, json_encode(['lecturer' => $acc['name'], 'account' => $acc['id'], 'sentAt' => date('c'), 'yearId' => $req['yearId'] ?? '', 'sessions' => array_values($latest)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        $backup = substr($f, strlen(DATA_DIR) + 1);
    }
    $pdo->prepare('INSERT INTO submissions VALUES (?,?,?,?,?,?,?,?)')->execute([$now, $acc['id'], $acc['name'], $acc['role'], count($latest), $absences, count($rejected), $backup]);
    $pdo->commit();
    return ['ok' => true, 'accepted' => $accepted, 'rejected' => $rejected, 'time' => $now];
}

function pull(array $acc, array $req) {
    $st = db()->prepare('SELECT courseId, firstReceived, lastReceived, sentBy, json FROM sessions WHERE lastReceived > ? ORDER BY lastReceived');
    $st->execute([(int) ($req['since'] ?? 0)]);
    $out = [];
    while ($r = $st->fetch(PDO::FETCH_ASSOC)) {
        if ($acc['role'] === 'lecturer' && !in_array($r['courseId'], $acc['courses'], true)) continue;
        $s = json_decode($r['json'], true); if (!$s) continue;
        $s['receivedAt'] = (int) $r['lastReceived']; $s['firstReceived'] = (int) $r['firstReceived']; $s['sentBy'] = $r['sentBy'];
        $out[] = $s;
    }
    return ['ok' => true, 'sessions' => $out, 'time' => now()];
}

function archive(array $acc, array $req) {
    $now = now();
    $dir = dir_of(['reports', $req['yearId'] ?? 'year', $acc['role'] === 'lecturer' ? $acc['name'] : 'official']);
    $files = [];
    foreach (array_slice($req['files'] ?? [], 0, 5) as $f) {
        $name = date('Y-m-d H-i') . ' - ' . preg_replace('/[\\\\\/:*?"<>|\x00-\x1f]+/u', '_', (string) ($f['name'] ?? 'report'));
        file_put_contents($dir . '/' . $name, (string) ($f['content'] ?? ''));
        $files[] = substr($dir . '/' . $name, strlen(DATA_DIR) + 1);
    }
    db()->prepare('INSERT INTO reports VALUES (?,?,?,?)')->execute([$now, $acc['id'], $acc['name'], implode("\n", $files)]);
    return ['ok' => true, 'files' => $files, 'time' => $now];
}
