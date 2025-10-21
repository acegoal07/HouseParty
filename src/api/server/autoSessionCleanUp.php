<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../utils/sessionHandler.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli') {
   http_response_code(403);
   header('Location: /403.html');
   exit();
}

$sessionHandler = new SessionHelper($conn);
$sessionHandler->cleanup();
$conn->close();
exit(0);
