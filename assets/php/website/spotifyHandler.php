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
   switch ($_GET['type']) {
         //////////////// getCurrentlyPlaying //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'getCurrentlyPlaying':
         if (!isset($_GET['partyId'])) {
            http_response_code(400);
            exit();
         }

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

         $stmt->close();
         $conn->close();

         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/currently-playing");
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $accessToken));
         $response = curl_exec($curl);
         curl_close($curl);

         echo $response;
         break;
         //////////////// searchSongByName //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'searchSongByName':
         if (!isset($_GET['partyId']) || !isset($_GET['searchTerm'])) {
            http_response_code(400);
            exit();
         }

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

         $stmt->close();
         $conn->close();

         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/search?q=" . $_GET['searchTerm'] . "&type=track&limit=50");
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $accessToken));
         $response = curl_exec($curl);
         curl_close($curl);

         echo $response;
         break;
         //////////////// default //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      default:
         http_response_code(400);
         break;
   }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
   switch ($_POST['type']) {
         //////////////// addSongToQueue //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'addSongToQueue':
         if (!isset($_POST['partyId']) || !isset($_POST['songId'])) {
            http_response_code(400);
            exit();
         }

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

         $stmt->close();
         $conn->close();

         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue?uri=" . $_POST['songId']);
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $accessToken));
         curl_setopt($curl, CURLOPT_POST, true);
         $response = curl_exec($curl);
         curl_close($curl);

         http_response_code(200);
         break;
         //////////////// default //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      default:
         http_response_code(400);
         break;
   }
} else {
   http_response_code(405);
}
