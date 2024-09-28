<?php
include '../php/databaseConnection.php';
include '../php/spotifyAppInformation.php';

if ($conn->connect_error) {
   die("Connection failed: " . $conn->connect_error);
} else {
   $sql = 'SELECT * FROM parties WHERE expires_at < NOW() + INTERVAL 5 MINUTE';
   $result = $conn->query($sql);
   if ($result->num_rows > 0) {
      while ($row = $result->fetch_assoc()) {
         $url = "https://accounts.spotify.com/api/token";
         $data = array(
            'grant_type' => 'refresh_token',
            'refresh_token' => $row['refresh_token'],
            'client_id' => $spotifyClientId
         );

         $options = array(
            'http' => array(
               'header' => "Content-type: application
               /x-www-form-urlencoded\r\n",
            )
         );

         $context = stream_context_create($options);
         $result = file_get_contents($url, false, $context);
         $result = json_decode($result, true);

         $sql = "UPDATE parties SET access_token = '" . $result['access_token'] . "', expires_at = NOW() + INTERVAL 1 HOUR WHERE refresh_token = '" . $row['refresh_token'] . "'";
         $conn->query($sql);
      }
   }
}
