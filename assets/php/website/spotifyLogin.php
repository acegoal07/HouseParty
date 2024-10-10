<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
include '../secrets.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if (isset($_GET['error'])) {
      header("Location: /houseparty/");
   } else {
      $url = "https://accounts.spotify.com/api/token";
      $data = array(
         'grant_type' => 'authorization_code',
         'code' => $_GET['code'],
         'redirect_uri' => 'https://aw1443.brighton.domains/houseparty/assets/php/website/spotifyLogin.php',
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

      setcookie("refresh_token", $result['refresh_token'], time() + 86400, "/", "", true);

      $url = "https://api.spotify.com/v1/me";
      $data = array(
         'grant_type' => 'authorization_code',
         'code' => $_GET['code'],
         'redirect_uri' => 'https://aw1443.brighton.domains/houseparty/assets/php/website/spotifyLogin.php',
         'client_id' => $spotifyClientId,
         'client_secret' => $spotifyClientSecret
      );
      $options = array(
         'http' => array(
            'header' => "Authorization: Bearer " . $result['access_token'] . "\r\n",
            'method' => 'GET'
         )
      );

      $context = stream_context_create($options);
      $result = file_get_contents($url, false, $context);
      $result = json_decode($result, true);

      setcookie("host_id", $result['id'], time() + 86400, "/", "", true);

      header("Location: /houseparty/");
   }
}
