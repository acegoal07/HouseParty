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

         $party_info = getPartyInfo($conn, $_GET['partyId']);
         if ($party_info == null) {
            http_response_code(400);
            exit();
         }

         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/currently-playing");
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
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

         $party_info = getPartyInfo($conn, $_GET['partyId']);
         if ($party_info == null) {
            http_response_code(400);
            exit();
         }

         $searchTerm = urlencode($_GET['searchTerm']);

         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/search?q=" . $searchTerm . "&type=track&limit=50");
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
         $response = curl_exec($curl);
         curl_close($curl);

         $responseData = json_decode($response, true);

         if (count($responseData['tracks']['items']) === 0) {
            http_response_code(200);
            echo json_encode(['totalTracks' => 0, 'tracks' => []]);
            exit();
         }

         if ($party_info['explicit'] == 0) {
            $responseData['tracks']['items'] = array_filter($responseData['tracks']['items'], function ($item) {
               return !$item['explicit'];
            });
         }

         http_response_code(200);
         echo json_encode(['totalTracks' => count($responseData['tracks']['items']), 'tracks' => $responseData['tracks']['items']]);
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

         $party_info = getPartyInfo($conn, $_POST['partyId']);
         if ($party_info == null) {
            http_response_code(400);
            exit();
         }

         if ($party_info['duplicateBlocked'] == 1) {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue");
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
            $response = curl_exec($curl);

            if ($response === false) {
               http_response_code(200);
               echo json_encode(['success' => false]);
               exit();
            }

            $responseData = json_decode($response, true);

            if (count($responseData['queue']) > 0) {
               $duplicate = false;
               foreach ($responseData['queue'] as $item) {
                  if ($item['uri'] === $_POST['songId']) {
                     $duplicate = true;
                     break;
                  }
               }

               if ($duplicate) {
                  http_response_code(200);
                  echo json_encode(['success' => true, 'duplicate' => true]);
                  exit();
               }
            }
         }

         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue?uri=" . $_POST['songId']);
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
         curl_setopt($curl, CURLOPT_POST, true);
         $response = curl_exec($curl);
         $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
         curl_close($curl);

         if ($responseCode !== 200) {
            http_response_code(200);
            echo json_encode(['success' => false]);
            exit();
         }

         http_response_code(200);
         echo json_encode(['success' => true, 'duplicate' => false]);
         break;
         //////////////// default //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      default:
         http_response_code(400);
         break;
   }
} else {
   http_response_code(405);
}


//////////////// get_authorisation //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Get the authorisation token for a party from the database
 * @param mixed $conn The database connection
 * @param mixed $partyId The party ID
 * @return mixed The authorisation token and explicit setting
 */
function getPartyInfo($conn, $partyId)
{
   $stmt = $conn->prepare("SELECT access_token, explicit, duplicate_blocked FROM parties WHERE party_id = ?");
   $stmt->bind_param("s", $partyId);
   $stmt->execute();

   if ($stmt->error) {
      http_response_code(500);
      exit();
   }

   $result = $stmt->get_result();

   if ($result->num_rows === 0) {
      http_response_code(400);
      exit();
   }

   $row = $result->fetch_assoc();

   $stmt->close();
   $conn->close();
   return ['auth' => "Authorization: Bearer " . $row['access_token'], 'explicit' => $row['explicit'], 'duplicateBlocked' => $row['duplicate_blocked']];
}
