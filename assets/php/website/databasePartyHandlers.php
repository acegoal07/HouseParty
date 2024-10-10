<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
include '../secrets.php';

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
         //////////////// partyExistsByRefreshToken //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'partyExistsByRefreshToken':
         if (!isset($_GET['refreshToken'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("SELECT explicit, party_id FROM parties WHERE refresh_token = ?");
         $stmt->bind_param("s", $_GET['refreshToken']);
         $stmt->execute();

         $result = $stmt->get_result();

         http_response_code(200);
         if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(array('partyExists' => true, 'explicit' => $row['explicit'], 'partyId' => $row['party_id']));
         } else {
            echo json_encode(array('partyExists' => false));
         }
         break;
         //////////////// partyExistsByHostId //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'partyExistsByHostId':
         if (!isset($_GET['hostId'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("SELECT explicit, party_id FROM parties WHERE host_id = ?");
         $stmt->bind_param("s", $_GET['hostId']);
         $stmt->execute();

         $result = $stmt->get_result();

         http_response_code(200);
         if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(array('partyExists' => true, 'explicit' => $row['explicit'], 'partyId' => $row['party_id']));
         } else {
            echo json_encode(array('partyExists' => false));
         }
         break;
         //////////////// partyExistsByPartyId //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'partyExistsByPartyId':
         if (!isset($_GET['partyId'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("SELECT explicit FROM parties WHERE party_id = ?");
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
         if (!isset($_POST['hostId']) || !isset($_POST['refresh_token']) || !isset($_POST['party_ends_in']) || !isset($_POST['explicit'])) {
            http_response_code(400);
            exit();
         }

         $partyId = generatePartyId();
         $stmt = $conn->prepare("SELECT * FROM parties WHERE party_id = ?");
         $stmt->bind_param("s", $partyId);
         $stmt->execute();

         $result = $stmt->get_result();

         while ($result->num_rows > 0) {
            $partyId = generatePartyId();
            $stmt->execute();
            $result = $stmt->get_result();
         }

         $url = "https://accounts.spotify.com/api/token";
         $client_id = $spotifyClientId;
         $client_secret = $spotifyClientSecret;
         $refresh_token = $_POST['refresh_token'];

         $data = array(
            'grant_type' => 'refresh_token',
            'refresh_token' => $refresh_token,
            'client_id' => $client_id
         );

         $headers = array(
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Basic ' . base64_encode($client_id . ':' . $client_secret)
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

         $accessToken = $result['access_token'];
         $tokenExpiresAtSeconds = time() + 3600;
         $tokenExpiresAt = new DateTime();
         $tokenExpiresAt->setTimestamp($tokenExpiresAtSeconds);
         $tokenExpiresAtFormatted = $tokenExpiresAt->format('Y-m-d H:i:s');

         $partyExpiresAtSeconds = time() + $_POST['party_ends_in'];
         $partyExpiresAt = new DateTime();
         $partyExpiresAt->setTimestamp($partyExpiresAtSeconds);
         $partyExpiresAtFormatted = $partyExpiresAt->format('Y-m-d H:i:s');

         $stmt = $conn->prepare("INSERT INTO parties (party_id, host_id, access_token, refresh_token, party_expires_at, token_expires_at, explicit) VALUES (?, ?, ?, ?, ?, ?, ?)");
         $stmt->bind_param("sssssss", $partyId, $_POST['hostId'], $accessToken, $_POST['refresh_token'], $partyExpiresAtFormatted, $tokenExpiresAtFormatted, $_POST['explicit']);
         $stmt->execute();

         if ($stmt->error) {
            echo json_encode(array('error' => $stmt->error));
            exit();
         }

         http_response_code(200);
         echo json_encode(array('partyId' => $partyId, 'hostId' => $_POST['hostId'], 'accessToken' => $accessToken, 'refreshToken' => $_POST['refresh_token'], 'partyExpiresAt' => $partyExpiresAt, 'tokenExpiresAt' => $tokenExpiresAt, 'explicit' => $_POST['explicit'], 'success' => true));
         break;
         //////////////// deleteParty //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'deleteParty':
         if (!isset($_POST['hostId']) || !isset($_POST['refreshToken'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("DELETE FROM parties WHERE host_id = ?");
         $stmt->bind_param("s", $_POST['hostId']);
         $stmt->execute();

         $stmt = $conn->prepare("SELECT * FROM parties WHERE host_id = ?");
         $stmt->bind_param("s", $_POST['hostId']);
         $stmt->execute();

         $result = $stmt->get_result();

         if ($result->num_rows > 0) {
            http_response_code(200);
            echo json_encode(array('success' => false));
         } else {
            http_response_code(200);
            echo json_encode(array('success' => true));
         }
         break;
         //////////////// updatePartyExplicit //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      case 'updatePartyExplicit':
         if (!isset($_POST['hostId']) || !isset($_POST['explicit'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("UPDATE parties SET explicit = ? WHERE host_id = ?");
         $stmt->bind_param("ss", $_POST['explicit'], $_POST['hostId']);
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
         if (!isset($_POST['hostId']) || !isset($_POST['party_ends_in'])) {
            http_response_code(400);
            exit();
         }
         $stmt = $conn->prepare("SELECT party_expires_at FROM parties WHERE host_id = ?");
         $stmt->bind_param("s", $_POST['hostId']);
         $stmt->execute();

         $result = $stmt->get_result();

         if ($result->num_rows === 0) {
            http_response_code(400);
            exit();
         }

         $row = $result->fetch_assoc();
         $partyExpiresAt = new DateTime($row['party_expires_at']);
         $partyExpiresAtSeconds = $partyExpiresAt->getTimestamp() + $_POST['party_ends_in'];
         $partyExpiresAt->setTimestamp($partyExpiresAtSeconds);
         $partyExpiresAtFormatted = $partyExpiresAt->format('Y-m-d H:i:s');

         $stmt = $conn->prepare("UPDATE parties SET party_expires_at = ? WHERE host_id = ?");
         $stmt->bind_param("ss", $partyExpiresAtFormatted, $_POST['hostId']);
         $stmt->execute();

         if ($stmt->affected_rows === 0) {
            http_response_code(400);
            exit();
         }

         http_response_code(200);
         echo json_encode(array('success' => true));
         break;
         //////////////// default //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      default:
         http_response_code(400);
         exit();
   }
} else {
   http_response_code(response_code: 405);
}

$conn->close();
