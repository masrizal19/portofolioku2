<?php
// ====================================================================
// SECURE FILE UPLOAD HANDLER
// Validates size, extension, MIME, randomizes filenames, blocks execution
// ====================================================================

require_once __DIR__ . '/database.php';

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit();
}

// Basic Authentication
session_start();
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$isAuthenticated = !empty($_SESSION['admin_logged_in']) || ($token === API_SECRET_KEY);

if (!$isAuthenticated && API_SECRET_KEY !== 'API_SECRET_KEY_PLACEHOLDER') {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized upload request."]);
    exit();
}

// Check if file is uploaded
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No file uploaded."]);
    exit();
}

$file = $_FILES['file'];
$category = isset($_POST['category']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['category']) : 'general';

// Define target directory on hosting
$baseUploadDir = __DIR__ . '/../uploads';
$subdirs = [
    'profile'    => $baseUploadDir . '/profile',
    'portfolio'  => $baseUploadDir . '/portfolio',
    'works'      => $baseUploadDir . '/works',
    'background' => $baseUploadDir . '/background',
    'cv'         => $baseUploadDir . '/cv',
    'general'    => $baseUploadDir . '/general'
];

$targetDir = $subdirs[$category] ?? $subdirs['general'];

// Ensure target directory exists and is writable
if (!file_exists($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to create target subfolder. Check write permissions."]);
        exit();
    }
}

// 1. Validate Upload Errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Upload failed with error code: " . $file['error']]);
    exit();
}

// 2. Size Validation (Limit to 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "File too large. Maximum size allowed is 5MB."]);
    exit();
}

// 3. Extension & MIME Validation
$originalName = basename($file['name']);
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

$allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf'];
$allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/pjpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
];

if (!in_array($ext, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid file extension. Only PNG, JPG, JPEG, GIF, WEBP, SVG, and PDF allowed."]);
    exit();
}

// Inspect MIME Type safely using PHP Fileinfo if available
$mimeType = '';
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
} else {
    $mimeType = $file['type'];
}

if (!in_array($mimeType, $allowedMimeTypes)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Security alert: File content does not match allowed MIME types."]);
    exit();
}

// Double Check: Executable code block protection
$bannedTokens = ['.php', '.phtml', '.php5', '.php4', '.php3', '.phps', '.htaccess', '.pl', '.py', '.sh', '.exe', '.sh'];
foreach ($bannedTokens as $token) {
    if (strpos($originalName, $token) !== false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Security violation: Upload rejected."]);
        exit();
    }
}

// 4. Generate Random Cryptographically Safe Filename
$randomName = bin2hex(random_bytes(16)) . '.' . $ext;
$targetFilePath = $targetDir . '/' . $randomName;

// 5. Move uploaded file securely
if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    // Return relative URL relative to root folder (which is compatible with absolute routing dynamically in CSS/HTML)
    $relativeUrl = '/uploads/' . $category . '/' . $randomName;
    
    // Auto-save this media library metadata into the media DB table if DB is active
    try {
        $stmt = $pdo->prepare("INSERT INTO media (id, name, type, size, upload_date, url, in_use) VALUES (?, ?, ?, ?, ?, ?, 0)");
        $stmt->execute([
            'm_' . uniqid(),
            $originalName,
            $mimeType,
            $file['size'],
            date('Y-m-d'),
            $relativeUrl
        ]);
    } catch (Exception $e) {
        // Silently pass if database is offline or not configured yet
    }

    echo json_encode([
        "status" => "success",
        "message" => "File uploaded successfully.",
        "url" => $relativeUrl,
        "name" => $originalName,
        "size" => $file['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to save file to local directory."]);
}
