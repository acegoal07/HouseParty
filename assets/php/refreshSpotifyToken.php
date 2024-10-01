<?php
include 'spotifyAppInformation.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if (isset($_GET['error'])) {
      header("Location: /houseparty/");
   } else {
      $url = "https://accounts.spotify.com/api/token";
      $data = array(
         'grant_type' => 'authorization_code',
         'code' => $_GET['code'],
         'redirect_uri' => 'https://aw1443.brighton.domains/houseparty/assets/php/spotifyLogin.php',
         'client_id' => $spotifyClientId,
         'client_secret' => $spotifyClientSecret
      );

      $options = array(
         'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
         )
      );

      $context = stream_context_create($options);
      $result = file_get_contents($url, false, $context);
      $result = json_decode($result, true);

      $accessToken = $result['access_token'];
      $refreshToken = $result['refresh_token'];
      echo json_encode(array('access_token' => $accessToken, 'refresh_token' => $refreshToken));
   }
}
