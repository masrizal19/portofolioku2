<?php
// ====================================================================
// DATABASE CONNECTION COMPONENT (PDO)
// Safe for shared hosting, manages cross-origin headers (CORS)
// ====================================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight CORS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$configFile = __DIR__ . '/../config/database.php';
$exampleFile = __DIR__ . '/../config/database.example.php';

if (file_exists($configFile)) {
    require_once $configFile;
} elseif (file_exists($exampleFile)) {
    require_once $exampleFile;
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database configuration file is missing. Please copy config/database.example.php to config/database.php"
    ]);
    exit();
}

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, $options);
} catch (\PDOException $e) {
    // Graceful fallback for local staging before user configures mysql
    http_response_code(200);
    echo json_encode([
        "status" => "offline",
        "message" => "Database offline. Fill your credentials in config/database.php",
        "debug" => $e->getMessage()
    ]);
    exit();
}
