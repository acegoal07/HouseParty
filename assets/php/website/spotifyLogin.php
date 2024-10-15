<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
include '../secrets.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if (isset($_GET['error'])) {
      header("Location: /houseparty/loginerror.html?error=1");
   } else {
      // Get access token
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://accounts.spotify.com/api/token");
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(
         array(
            'grant_type' => 'authorization_code',
            'code' => $_GET['code'],
            'redirect_uri' => 'https://aw1443.brighton.domains/houseparty/assets/php/website/spotifyLogin.php',
            'client_id' => $spotifyClientId,
            'client_secret' => $spotifyClientSecret
         )
      ));
      curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($ch);
      curl_close($ch);

      if (curl_errno($ch)) {
         error_log('cURL Error: ' . curl_error($ch));
         http_response_code(500);
         exit();
      }

      $result = json_decode($response, true);
      if (json_last_error() !== JSON_ERROR_NONE) {
         error_log('JSON Decode Error: ' . json_last_error_msg());
         http_response_code(500);
         exit();
      }

      $stored_refresh_token = $result['refresh_token'];

      // Get host ID
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/me");
      curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $result['access_token']));
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($ch);
      $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      if ($http_code === 403) {
         header("Location: /houseparty/loginerror.html?error=2");
         exit();
      }

      if (curl_errno($ch)) {
         error_log('cURL Error: ' . curl_error($ch));
         http_response_code(500);
         exit();
      }

      $result = json_decode($response, true);
      if (json_last_error() !== JSON_ERROR_NONE) {
         error_log('JSON Decode Error: ' . json_last_error_msg());
         http_response_code(500);
         exit();
      }

      if (!isset($result['id'])) {
         error_log('Error: Missing host_id in response');
         http_response_code(500);
         exit();
      }

      if ($result['product'] !== 'premium') {
         header("Location: /houseparty/loginerror.html?error=3");
         exit();
      }

      setcookie("host_id", $result['id'], time() + 86400, "/", "", true);

      // Refresh token check
      $stmt = $conn->prepare("SELECT refresh_token FROM parties WHERE host_id = ? COLLATE utf8_bin");
      $stmt->bind_param("s", $result['id']);
      $stmt->execute();

      $query_result = $stmt->get_result();

      $final_refresh_token = $stored_refresh_token;
      if ($query_result->num_rows > 0) {
         $row = $query_result->fetch_assoc();
         if ($row['refresh_token'] !== $stored_refresh_token) {
            $final_refresh_token = $row['refresh_token'];
         }
      }

      setcookie("refresh_token", $final_refresh_token, time() + 86400, "/", "", true);

      $stmt->close();
      $conn->close();

      header("Location: /houseparty/");
      exit();
   }
} else {
   http_response_code(405);
   exit();
}
