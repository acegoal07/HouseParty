<?php
include __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli') {
   http_response_code(403);
   header('Location: /403.html');
   exit();
}

// Set to run every minute
$sql = "DELETE FROM parties WHERE party_expires_at <= UTC_TIMESTAMP() + INTERVAL 1 HOUR";
$conn->query($sql);

$conn->close();
exit(0);
