<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../utils/session.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli') {
   http_response_code(403);
   header('Location: /403.html');
   exit();
}

// Delete expired sessions
$conn->query("DELETE FROM sessions WHERE expires_at <= NOW()");

// Delete users without active sessions or parties
$conn->query("DELETE u FROM users u
              LEFT JOIN sessions s ON u.host_id = s.host_id
              LEFT JOIN parties p ON u.host_id = p.host_id
              WHERE s.session_id IS NULL AND p.party_id IS NULL");

$conn->close();

exit(0);
