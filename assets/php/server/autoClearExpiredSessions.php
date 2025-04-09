<?php
include __DIR__ . '/../secrets.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");

// SQL statement to delete expired sessions
// DELETE FROM parties WHERE party_expires_at <= CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', 'Europe/London');
$sql = "DELETE FROM parties WHERE party_expires_at <= UTC_TIMESTAMP() + INTERVAL 1 HOUR";

if ($conn->query($sql) === true) {
   echo "Expired sessions cleared successfully.";
} else {
   echo "Error clearing expired sessions: {$conn->error}";
}

$conn->close();
