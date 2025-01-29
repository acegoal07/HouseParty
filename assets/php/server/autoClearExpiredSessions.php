<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");

include __DIR__ . '/../secrets.php';

// SQL statement to delete expired sessions
// DELETE FROM parties WHERE party_expires_at <= CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', 'Europe/London');
$sql = "DELETE FROM parties WHERE party_expires_at <= UTC_TIMESTAMP() + INTERVAL 1 HOUR";

if ($conn->query($sql) === TRUE) {
   echo "Expired sessions cleared successfully.";
} else {
   echo "Error clearing expired sessions: " . $conn->error;
}

$conn->close();
