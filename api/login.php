<?php
// ====================================================================
// API ENDPOINT: ADMIN LOGIN AUTHENTICATION
// Securely verifies username and hash, manages local PHP sessions
// ====================================================================

require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Use POST."]);
    exit();
}

$inputJSON = file_get_contents('php://input');
$request = json_decode($inputJSON, true);

$username = isset($request['username']) ? trim($request['username']) : '';
$password = isset($request['password']) ? trim($request['password']) : '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Username and password are required."]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        // Start secure local session
        session_start();
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_user'] = $admin['username'];
        $_SESSION['admin_id'] = $admin['id'];

        // Generate simple secure login token
        $token = hash_hmac('sha256', $admin['username'] . time(), API_SECRET_KEY);

        echo json_encode([
            "status" => "success",
            "message" => "Authentication successful.",
            "token" => $token,
            "user" => [
                "username" => $admin['username'],
                "email" => $admin['email']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid username or password."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Authentication server error.",
        "debug" => $e->getMessage()
    ]);
}
