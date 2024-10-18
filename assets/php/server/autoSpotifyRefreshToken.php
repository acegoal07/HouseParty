<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
// Spotify API credentials
global $spotifyClientId;
$spotifyClientId = '67fa8a1f5eec455495394d8429fede37';
global $spotifyClientSecret;
$spotifyClientSecret = '282380b244c54d8dbd31a74a4a49ae8b';
// Database credentials
$host = 'localhost';
$user = 'aw1443_housePartyController';
$pass = 'qHzzdp^)D+v-WO&3z^';
$db = 'aw1443_houseParty';
$port = '3306';

$conn = new mysqli($host, $user, $pass, $db, $port);

$sql = 'SELECT * FROM parties WHERE token_expires_at <= UTC_TIMESTAMP() + INTERVAL 1 HOUR + INTERVAL 15 MINUTE';
$result = $conn->query($sql);

if ($result->num_rows > 0) {
   error_log("Rows found to update");
   while ($row = $result->fetch_assoc()) {
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://accounts.spotify.com/api/token");
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt(
         $ch,
         CURLOPT_POSTFIELDS,
         http_build_query(
            array(
               'grant_type' => 'refresh_token',
               'refresh_token' => $row['refresh_token'],
               'client_id' => $spotifyClientId
            )
         )
      );
      curl_setopt(
         $ch,
         CURLOPT_HTTPHEADER,
         array(
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Basic ' . base64_encode($spotifyClientId . ':' .  $spotifyClientSecret)
         )
      );
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($ch);
      curl_close($ch);

      $responseData = json_decode($response, true);

      $timezone = new DateTimeZone('Europe/London');
      date_default_timezone_set($timezone->getName());
      $timestamp_formatted = 'Y-m-d H:i:s';

      $accessToken = $responseData['access_token'];

      $tokenExpiresAt = new DateTime();
      $tokenExpiresAt->setTimezone($timezone);
      $tokenExpiresAt->setTimestamp(time() + 3600);
      $tokenExpiresAtFormatted = $tokenExpiresAt->format($timestamp_formatted);

      $sql = "UPDATE parties SET access_token = '" . $accessToken . "', token_expires_at = '" . $tokenExpiresAtFormatted . "' WHERE refresh_token = '" . $row['refresh_token'] . "'";
      $updateResult = $conn->query($sql);
   }
}
