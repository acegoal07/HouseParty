<?php
if ($_GET['error']) {
   echo "Error: " . $_GET['error'] . "<br>";
} else {
   $url = "https://accounts.spotify.com/api/token";
   $data = array(
      'grant_type' => 'authorization_code',
      'code' => $_GET['code'],
      'redirect_uri' => 'http://localhost/houseparty/assets/php/spotifyLogin.php',
      'client_id' => '67fa8a1f5eec455495394d8429fede37',
      'client_secret' => '282380b244c54d8dbd31a74a4a49ae8b'
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

   setCookie("token", $result['access_token'], time() + 3600, "/");
   setcookie("refresh_token", $result['refresh_token'], time() + 3600, "/");
   setcookie("access_token", $result['access_token'], time() + 3600, "/");

   header("Location: /houseparty/");
}
