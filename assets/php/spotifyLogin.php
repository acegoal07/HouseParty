<?php
include 'spotifyAppInformation.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if ($_GET['error']) {
      header("Location: /houseparty/");
   } else {
      $url = "https://accounts.spotify.com/api/token";
      $data = array(
         'grant_type' => 'authorization_code',
         'code' => $_GET['code'],
         'redirect_uri' => 'http://localhost/houseparty/assets/php/spotifyLogin.php',
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

      setCookie("code", $_GET['code'], time() + 3600, "/");
      setcookie("refresh_token", $result['refresh_token'], time() + 3600, "/");
      setcookie("access_token", $result['access_token'], time() + 3600, "/");

      header("Location: /houseparty/");
   }
}
