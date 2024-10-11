<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
include '../secrets.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if (isset($_GET['error'])) {
      header("Location: /houseparty/");
   } else {
      // Get access token
      $url = "https://accounts.spotify.com/api/token";
      $data = array(
         'grant_type' => 'authorization_code',
         'code' => $_GET['code'],
         'redirect_uri' => 'https://aw1443.brighton.domains/houseparty/assets/php/website/spotifyLogin.php',
         'client_id' => $spotifyClientId,
         'client_secret' => $spotifyClientSecret
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

      setcookie("refresh_token", $result['refresh_token'], time() + 86400, "/", "", true);
      // Get user ID
      $url = "https://api.spotify.com/v1/me";
      $headers = array(
         'Authorization: Bearer ' . $result['access_token']
      );

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      $response = curl_exec($ch);
      $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

      if ($http_code === 403) {
         unset($_COOKIE['refresh_token']);
         header("Location: /houseparty/indevelopment.html");
      }

      if (curl_errno($ch)) {
         echo 'Error:' . curl_error($ch);
         http_response_code(500);
         exit();
      }

      curl_close($ch);

      $result = json_decode($response, true);

      setcookie("host_id", $result['id'], time() + 86400, "/", "", true);

      header("Location: /houseparty/");
   }
}
