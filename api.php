<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$db_file = 'db.sqlite';
$db = new SQLite3($db_file);

// 1. Initialize DB
$db->exec("CREATE TABLE IF NOT EXISTS rooms (
    room_code TEXT PRIMARY KEY,
    round INTEGER DEFAULT 0,
    letter TEXT,
    categories TEXT,
    starts_at REAL,
    ends_at REAL,
    ended_at REAL,
    status TEXT DEFAULT 'waiting',
    created_at INTEGER
)");

$db->exec("CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_code TEXT,
    player_name TEXT,
    last_seen INTEGER,
    answers TEXT,
    UNIQUE(room_code, player_name)
)");

$action = $_GET['action'] ?? '';
$room_code = strtoupper(preg_replace('/[^A-Z0-9]/', '', $_REQUEST['room_code'] ?? ''));
$player_name = mb_substr(trim(strip_tags($_REQUEST['player_name'] ?? '')), 0, 25);

if (!$room_code) {
    echo json_encode(['error' => 'Código da sala inválido']);
    exit;
}

// 3. Simple Cleanup (Delete rooms/players inactive for > 24h)
if (rand(1, 100) === 1) { // 1% chance per request to keep it "simple"
    $cutoff = time() - 86400;
    $db->exec("DELETE FROM rooms WHERE created_at < $cutoff OR (starts_at IS NOT NULL AND starts_at < $cutoff)");
    $db->exec("DELETE FROM players WHERE last_seen < $cutoff");
}

// 2. Actions
switch ($action) {
    case 'join':
        // Ensure room exists
        $stmt = $db->prepare("SELECT * FROM rooms WHERE room_code = :rc");
        $stmt->bindValue(':rc', $room_code);
        $res = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        
        if (!$res) {
            $stmt = $db->prepare("INSERT INTO rooms (room_code, categories, status, created_at) VALUES (:rc, :cats, 'waiting', :now)");
            $stmt->bindValue(':rc', $room_code);
            $stmt->bindValue(':cats', 'Nome|Animal|Cidade|Objeto|Comida|Profissão');
            $stmt->bindValue(':now', time());
            $stmt->execute();
        }

        // Add/Update player
        if ($player_name) {
            $stmt = $db->prepare("INSERT INTO players (room_code, player_name, last_seen) VALUES (:rc, :pn, :now)
                                 ON CONFLICT(room_code, player_name) DO UPDATE SET last_seen = :now");
            $stmt->bindValue(':rc', $room_code);
            $stmt->bindValue(':pn', $player_name);
            $stmt->bindValue(':now', time());
            $stmt->execute();
        }
        echo json_encode(['success' => true]);
        break;

    case 'status':
        // Fetch Room
        $stmt = $db->prepare("SELECT * FROM rooms WHERE room_code = :rc");
        $stmt->bindValue(':rc', $room_code);
        $room = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        
        if (!$room) {
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        // Update player last_seen
        if ($player_name) {
            $stmt = $db->prepare("UPDATE players SET last_seen = :now WHERE room_code = :rc AND player_name = :pn");
            $stmt->bindValue(':rc', $room_code);
            $stmt->bindValue(':pn', $player_name);
            $stmt->bindValue(':now', time());
            $stmt->execute();
        }

        // Fetch Players (active in last 30s)
        $stmt = $db->prepare("SELECT player_name, last_seen, answers FROM players WHERE room_code = :rc AND last_seen > :cutoff");
        $stmt->bindValue(':rc', $room_code);
        $stmt->bindValue(':cutoff', time() - 30);
        $res = $stmt->execute();
        $players = [];
        while($row = $res->fetchArray(SQLITE3_ASSOC)) {
            $players[] = [
                'name' => $row['player_name'],
                'answers' => $row['answers'] ? json_decode($row['answers'], true) : null
            ];
        }

        echo json_encode([
            'room' => [
                'code' => $room['room_code'],
                'round' => (int)$room['round'],
                'letter' => $room['letter'],
                'categories' => explode('|', $room['categories']),
                'starts_at' => (float)$room['starts_at'] * 1000, // Client uses MS
                'ends_at' => $room['ends_at'] ? (float)$room['ends_at'] * 1000 : null,
                'ended_at' => $room['ended_at'] ? (float)$room['ended_at'] * 1000 : null,
                'status' => $room['status']
            ],
            'players' => $players,
            'server_time' => microtime(true) * 1000
        ]);
        break;

    case 'start':
        $letter = $_POST['letter'] ?? 'A';
        $seconds = (int)($_POST['seconds'] ?? 60);
        $cats = $_POST['categories'] ?? '';
        $round = (int)($_POST['round'] ?? 1);
        $no_limit = ($_POST['noLimit'] ?? 'false') === 'true';

        $now = microtime(true);
        $prep = 15; // 15s preparation
        $starts_at = $now + $prep;
        $ends_at = $no_limit ? null : ($starts_at + $seconds);

        $stmt = $db->prepare("UPDATE rooms SET round = :r, letter = :l, categories = :c, starts_at = :sa, ends_at = :ea, ended_at = NULL, status = 'playing' WHERE room_code = :rc");
        $stmt->bindValue(':r', $round);
        $stmt->bindValue(':l', $letter);
        $stmt->bindValue(':c', $cats);
        $stmt->bindValue(':sa', $starts_at);
        $stmt->bindValue(':ea', $ends_at);
        $stmt->bindValue(':rc', $room_code);
        $stmt->execute();

        // Clear player answers for new round
        $stmt = $db->prepare("UPDATE players SET answers = NULL WHERE room_code = :rc");
        $stmt->bindValue(':rc', $room_code);
        $stmt->execute();

        echo json_encode(['success' => true]);
        break;

    case 'stop':
        $stmt = $db->prepare("UPDATE rooms SET ended_at = :now, status = 'ended' WHERE room_code = :rc AND ended_at IS NULL");
        $stmt->bindValue(':now', time());
        $stmt->bindValue(':rc', $room_code);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    case 'submit':
        $answers = $_POST['answers'] ?? '{}';
        $stmt = $db->prepare("UPDATE players SET answers = :ans WHERE room_code = :rc AND player_name = :pn");
        $stmt->bindValue(':ans', $answers);
        $stmt->bindValue(':rc', $room_code);
        $stmt->bindValue(':pn', $player_name);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['error' => 'Unknown action']);
        break;
}
