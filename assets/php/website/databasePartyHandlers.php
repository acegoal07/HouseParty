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

function generatePartyId()
{
   $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
   $charactersLength = strlen($characters);
   $randomString = '';
   for ($i = 0; $i < 6; $i++) {
      $randomString .= $characters[rand(0, $charactersLength - 1)];
   }
   return $randomString;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   switch ($_GET['type']) {
         //////////////// checkPartyExistsHost //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'checkPartyExistsHost':
         if (!isset($_GET['hostId']) || !isset($_GET['refreshToken'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("SELECT explicit, party_id, party_expires_at, refresh_token FROM parties WHERE host_id = ? COLLATE utf8_bin");
         $stmt->bind_param("s", $_GET['hostId']);
         $stmt->execute();

         $result = $stmt->get_result();

         http_response_code(200);
         if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if ($row['refresh_token'] !== $_GET['refreshToken']) {
               echo json_encode(array('partyExists' => true, 'refreshTokenValid' => false));
               exit();
            }
            echo json_encode(array('partyExists' => true, 'refreshTokenValid' => true, 'explicit' => $row['explicit'], 'partyId' => $row['party_id'], 'partyExpiresAt' => $row['party_expires_at']));
         } else {
            echo json_encode(array('partyExists' => false, 'refreshTokenValid' => false));
         }
         break;
         //////////////// partyExistsByPartyId //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'checkPartyExistsUser':
         if (!isset($_GET['partyId'])) {
            http_response_code(400);
            exit();
         }

         $stmt = $conn->prepare("SELECT explicit FROM parties WHERE party_id = ? COLLATE utf8_bin");
         $stmt->bind_param("s", $_GET['partyId']);
         $stmt->execute();

         $result = $stmt->get_result();

         http_response_code(200);
         if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(array('partyExists' => true, 'explicit' => $row['explicit']));
         } else {
            echo json_encode(array('partyExists' => false));
         }
         break;
         //////////////// default //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      default:
         http_response_code(400);
         exit();
   }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
   switch ($_POST['type']) {
         //////////////// createParty //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'createParty':
         if (!isset($_POST['hostId']) || !isset($_POST['refreshToken']) || !isset($_POST['partyEndsIn']) || !isset($_POST['explicit'])) {
            http_response_code(400);
            exit();
         }

         $partyId = generatePartyId();
         $stmt = $conn->prepare("SELECT * FROM parties WHERE party_id = ? COLLATE utf8_bin");
         $stmt->bind_param("s", $partyId);
         $stmt->execute();

         $result = $stmt->get_result();

         while ($result->num_rows > 0) {
            $partyId = generatePartyId();
            $stmt->execute();
            $result = $stmt->get_result();
         }

         $url = "https://accounts.spotify.com/api/token";
         $data = array(
            'grant_type' => 'refresh_token',
            'refresh_token' => $_POST['refreshToken'],
            'client_id' => $spotifyClientId
         );
         $headers = array(
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Basic ' . base64_encode($spotifyClientId . ':' .  $spotifyClientSecret)
         );

         $ch = curl_init();

         curl_setopt($ch, CURLOPT_URL, $url);
         curl_setopt($ch, CURLOPT_POST, true);
         curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
         curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

         $response = curl_exec($ch);

         if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
            http_response_code(500);
            exit();
         }

         curl_close($ch);

         $result = json_decode($response, true);

         $timezone = new DateTimeZone('Europe/London');
         date_default_timezone_set($timezone->getName());
         $timestamp_formatted = 'Y-m-d H:i:s';

         $accessToken = $result['access_token'];

         $tokenExpiresAt = new DateTime();
         $tokenExpiresAt->setTimezone($timezone);
         $tokenExpiresAt->setTimestamp(time() + 3600);
         $tokenExpiresAtFormatted = $tokenExpiresAt->format($timestamp_formatted);

         $partyExpiresAt = new DateTime();
         $partyExpiresAt->setTimezone($timezone);
         $partyExpiresAt->setTimestamp(time() + $_POST['partyEndsIn'] * 3600);
         $partyExpiresAtFormatted = $partyExpiresAt->format($timestamp_formatted);

         $stmt = $conn->prepare("INSERT INTO parties (party_id, host_id, access_token, refresh_token, party_expires_at, token_expires_at, explicit) VALUES (?, ?, ?, ?, ?, ?, ?)");
         $stmt->bind_param("sssssss", $partyId, $_POST['hostId'], $accessToken, $_POST['refreshToken'], $partyExpiresAtFormatted, $tokenExpiresAtFormatted, $_POST['explicit']);
         $stmt->execute();

         if ($stmt->error) {
            echo json_encode(array('error' => $stmt->error));
            exit();
         }

         http_response_code(200);
         echo json_encode(array('success' => true));
         break;
         //////////////// deleteParty //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'deleteParty':
         if (!isset($_POST['hostId']) || !isset($_POST['refreshToken'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("DELETE FROM parties WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
         $stmt->bind_param("ss", $_POST['hostId'], $_POST['refreshToken']);
         $stmt->execute();

         if ($stmt->affected_rows === 0) {
            http_response_code(400);
            exit();
         }

         http_response_code(200);
         echo json_encode(array('success' => true));
         break;
         //////////////// updatePartyExplicit //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'updatePartyExplicit':
         if (!isset($_POST['hostId']) || !isset($_POST['refreshToken'])  || !isset($_POST['explicit'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("UPDATE parties SET explicit = ? WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
         $stmt->bind_param("sss", $_POST['explicit'], $_POST['hostId'], $_POST['refreshToken']);
         $stmt->execute();

         if ($stmt->affected_rows === 0) {
            http_response_code(400);
            exit();
         }

         http_response_code(200);
         echo json_encode(array('success' => true));
         break;
         //////////////// extendPartyDuration //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'extendPartyDuration':
         if (!isset($_POST['hostId']) || !isset($_POST['refreshToken']) || !isset($_POST['extendBy'])) {
            http_response_code(400);
            error_log('Missing parameters');
            exit();
         }
         $stmt = $conn->prepare("SELECT party_expires_at FROM parties WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
         $stmt->bind_param("ss", $_POST['hostId'], $_POST['refreshToken']);
         $stmt->execute();

         $result = $stmt->get_result();

         if ($result->num_rows === 0) {
            http_response_code(400);
            error_log('No party found with the given hostId and refreshToken');
            exit();
         }

         $row = $result->fetch_assoc();
         $partyExpiresAt = new DateTime($row['party_expires_at']);
         $partyExpiresAtSeconds = $partyExpiresAt->getTimestamp() + $_POST['extendBy'] * 3600;
         $partyExpiresAt->setTimestamp($partyExpiresAtSeconds);
         $partyExpiresAtFormatted = $partyExpiresAt->format('Y-m-d H:i:s');

         $stmt = $conn->prepare("UPDATE parties SET party_expires_at = ? WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
         $stmt->bind_param("sss", $partyExpiresAtFormatted, $_POST['hostId'], $_POST['refreshToken']);
         $stmt->execute();

         if ($stmt->affected_rows === 0) {
            http_response_code(400);
            error_log('No party found with the given hostId and refreshToken so nothing updated');
            exit();
         }

         http_response_code(200);
         echo json_encode(array('success' => true));
         break;
         //////////////// default //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      default:
         http_response_code(400);
         error_log('invalid function');
         exit();
   }
} else {
   http_response_code(response_code: 405);
}

$conn->close();
