<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../utils/session.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli') {
   http_response_code(403);
   header('Location: /403.html');
   exit();
}

$targetFunction = $argv[1] ?? '';

switch ($targetFunction) {
   case 'cleanupExpiredData':
      // Delete expired parties, sessions, and users without active sessions or parties
      // Set to run every minute
      $conn->query("DELETE FROM parties WHERE party_expires_at <= UTC_TIMESTAMP() AND permanent = 0");
      $conn->query("DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()");
      $conn->query("
            DELETE u
            FROM users u
            LEFT JOIN sessions s ON u.host_id = s.host_id
            LEFT JOIN parties p ON u.host_id = p.host_id
            WHERE s.session_id IS NULL AND p.party_id IS NULL
         ");
      $conn->close();
      break;
   case 'refreshAccessTokens':
      // Refresh Spotify access tokens for parties whose tokens are expiring within the next 15 minutes
      // Set to run every 5 minutes
      $stmt = $conn->prepare("SELECT p.party_id, u.refresh_token FROM parties p JOIN users u ON p.host_id = u.host_id WHERE p.token_expires_at <= UTC_TIMESTAMP() + INTERVAL 15 MINUTE");
      $stmt->execute();
      $result = $stmt->get_result();

      if ($result->num_rows !== 0) {
         $timezone = new DateTimeZone('Europe/London');
         date_default_timezone_set($timezone->getName());
         $timestamp_formatted = 'Y-m-d H:i:s';

         while ($row = $result->fetch_assoc()) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://accounts.spotify.com/api/token");
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt(
               $ch,
               CURLOPT_POSTFIELDS,
               http_build_query(
                  [
                     'grant_type' => 'refresh_token',
                     'refresh_token' => $row['refresh_token'],
                     'client_id' => $spotifyClientId
                  ]
               )
            );
            curl_setopt(
               $ch,
               CURLOPT_HTTPHEADER,
               [
                  'Content-Type: application/x-www-form-urlencoded',
                  'Authorization: Basic ' . base64_encode("{$spotifyClientId}:{$spotifyClientSecret}")
               ]
            );
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            $responseData = json_decode($response, true);
            curl_close($ch);

            $tokenExpiresAt = gmdate('Y-m-d H:i:00',  time() + 3600);

            $stmt = $conn->prepare("UPDATE parties SET access_token = ?, token_expires_at = ? WHERE party_id = ? COLLATE latin1_bin");
            $stmt->bind_param("sss", $responseData['access_token'], $tokenExpiresAt, $row['party_id']);
            $stmt->execute();
            $stmt->close();
         }
      }

      $conn->close();
      break;
   default:
      // Invalid or no function specified
      echo "No valid function specified.\n";
      break;
}

exit(0);
