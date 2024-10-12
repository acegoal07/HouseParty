<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
header("Access-Control-Allow-Methods: POST, GET");

include '../secrets.php';

$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

$allowedDomain = 'https://aw1443.brighton.domains/';
if (strpos($referer, $allowedDomain) !== 0 && strpos($origin, $allowedDomain) !== 0) {
   http_response_code(403);
   echo json_encode(array('error' => 'Forbidden'));
   exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if ($_GET['type'] === 'getCurrentlyPlaying') {
      $stmt = $conn->prepare("SELECT access_token FROM parties WHERE party_id = ?");
      $stmt->bind_param("s", $_GET['partyId']);
      $stmt->execute();

      $result = $stmt->get_result();

      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         $accessToken = $row['access_token'];
      } else {
         http_response_code(400);
         exit();
      }

      $curl = curl_init();

      curl_setopt_array($curl, array(
         CURLOPT_URL => "https://api.spotify.com/v1/me/player/currently-playing",
         CURLOPT_RETURNTRANSFER => true,
         CURLOPT_ENCODING => "",
         CURLOPT_MAXREDIRS => 10,
         CURLOPT_TIMEOUT => 0,
         CURLOPT_FOLLOWLOCATION => true,
         CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
         CURLOPT_CUSTOMREQUEST => "GET",
         CURLOPT_HTTPHEADER => array(
            "Authorization: Bearer " . $accessToken
         ),
      ));

      $response = curl_exec($curl);
      curl_close($curl);

      echo $response;
   } elseif ($_GET['type'] === 'searchSongByName') {
      $stmt = $conn->prepare("SELECT access_token FROM parties WHERE party_id = ?");
      $stmt->bind_param("s", $_POST['partyId']);
      $stmt->execute();

      $result = $stmt->get_result();

      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         $accessToken = $row['access_token'];
      } else {
         http_response_code(400);
         exit();
      }

      $curl = curl_init();

      curl_setopt_array($curl, array(
         CURLOPT_URL => "https://api.spotify.com/v1/search?q=" . $_GET['searchTerm'] . "&type=track&limit=50",
         CURLOPT_RETURNTRANSFER => true,
         CURLOPT_ENCODING => "",
         CURLOPT_MAXREDIRS => 10,
         CURLOPT_TIMEOUT => 0,
         CURLOPT_FOLLOWLOCATION => true,
         CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
         CURLOPT_CUSTOMREQUEST => "GET",
         CURLOPT_HTTPHEADER => array(
            "Authorization: Bearer " . $spotifyAccessToken
         ),
      ));

      $response = curl_exec($curl);
      curl_close($curl);

      echo $response;
   } else {
      http_response_code(400);
   }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
   if ($_POST['type'] === 'addSongToQueue') {
      $stmt = $conn->prepare("SELECT access_token FROM parties WHERE party_id = ?");
      $stmt->bind_param("s", $_POST['partyId']);
      $stmt->execute();

      $result = $stmt->get_result();

      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         $accessToken = $row['access_token'];
      } else {
         http_response_code(400);
         exit();
      }

      $curl = curl_init();

      curl_setopt_array($curl, array(
         CURLOPT_URL => "https://api.spotify.com/v1/me/player/queue?uri=" . $_POST['songId'],
         CURLOPT_RETURNTRANSFER => true,
         CURLOPT_ENCODING => "",
         CURLOPT_MAXREDIRS => 10,
         CURLOPT_TIMEOUT => 0,
         CURLOPT_FOLLOWLOCATION => true,
         CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
         CURLOPT_CUSTOMREQUEST => "POST",
         CURLOPT_HTTPHEADER => array(
            "Authorization: Bearer " . $accessToken
         ),
      ));

      $response = curl_exec($curl);
      curl_close($curl);
      http_response_code(200);
   } else {
      http_response_code(400);
   }
} else {
   http_response_code(405);
}
