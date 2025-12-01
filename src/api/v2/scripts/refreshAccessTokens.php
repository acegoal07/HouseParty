<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/getAccessToken.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli') {
   http_response_code(403);
   header('Location: /403.html');
   exit();
}

$stmt = $conn->prepare("SELECT p.party_id, u.refresh_token FROM parties p JOIN users u ON p.host_id = u.host_id WHERE p.token_expires_at <= UTC_TIMESTAMP() + INTERVAL 15 MINUTE");
$stmt->execute();
$results = $stmt->get_result();

while ($row = $results->fetch_assoc()) {
   $accessToken = getAccessToken($row['refresh_token']);
   $tokenExpiresAt = gmdate('Y-m-d H:i:00',  time() + 3600);

   $stmt = $conn->prepare("UPDATE parties SET access_token = ?, token_expires_at = ? WHERE party_id = ? COLLATE latin1_bin");
   $stmt->bind_param("sss", $accessToken, $tokenExpiresAt, $row['party_id']);
   $stmt->execute();
   $stmt->close();
}

$conn->close();
exit(0);
