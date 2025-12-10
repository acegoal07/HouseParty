<?php
include __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli') {
   http_response_code(403);
   header('Location: /403.html');
   exit();
}

// Delete any parties that are expired and are not set as permanent
$conn->query("DELETE FROM parties WHERE party_expires_at <= UTC_TIMESTAMP() AND permanent = 0");

// Delete any sessions that are expired
$conn->query("DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()");

// Delete any leftover users if there are no active parties or sessions
$conn->query("
            DELETE u
            FROM users u
            LEFT JOIN sessions s ON u.host_id = s.host_id
            LEFT JOIN parties p ON u.host_id = p.host_id
            WHERE s.session_id IS NULL AND p.party_id IS NULL
         ");

$conn->close();
exit(0);
