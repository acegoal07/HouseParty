<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
include '../secrets.php';

if ($conn->connect_error) {
   die("Connection failed: " . $conn->connect_error);
} else {
   $sql = 'SELECT * FROM parties WHERE token_expires_at <= UTC_TIMESTAMP() + INTERVAL 1 HOUR + INTERVAL 15 MINUTE';
   $result = $conn->query($sql);
   if ($result->num_rows > 0) {
      while ($row = $result->fetch_assoc()) {
         $url = "https://accounts.spotify.com/api/token";
         $data = array(
            'grant_type' => 'refresh_token',
            'refresh_token' => $row['refresh_token'],
            'client_id' => $spotifyClientId
         );

         $ch = curl_init();
         curl_setopt($ch, CURLOPT_URL, $url);
         curl_setopt($ch, CURLOPT_POST, true);
         curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
         curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

         $response = curl_exec($ch);
         if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
            http_response_code(500);
            exit();
         }
         curl_close($ch);

         $result = json_decode($response, true);

         $sql = "UPDATE parties SET access_token = '" . $result['access_token'] . "', token_expires_at = UTC_TIMESTAMP() + INTERVAL 2 HOUR WHERE refresh_token = '" . $row['refresh_token'] . "'";
         $conn->query($sql);
      }
   }
}
