<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");

include __DIR__ . '/../secrets.php';

$sql = 'SELECT * FROM parties WHERE token_expires_at <= UTC_TIMESTAMP() + INTERVAL 1 HOUR + INTERVAL 15 MINUTE';
$result = $conn->query($sql);

if ($result->num_rows > 0) {
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
