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
   if ($_GET['type'] === 'partyExistsByRefreshToken') {
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
   } elseif ($_GET['type'] === 'partyExistsByPartyId') {
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
   } elseif ($_GET['type'] === 'getPartyIdByHostId') {
      if (!isset($_GET['hostId'])) {
         http_response_code(400);
         exit();
      }
      $stmt = $conn->prepare("SELECT party_id FROM parties WHERE host_spotify_id = ?");
      $stmt->bind_param("s", $_GET['hostId']);
      $stmt->execute();

      $result = $stmt->get_result();

      http_response_code(200);
      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         echo json_encode(array('partyId' => $row['party_id']));
      } else {
         echo json_encode(array('partyId' => null));
      }
   } else {
      http_response_code(400);
   }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
   if ($_POST['type'] === 'createParty') {
      if (!isset($_POST['hostId']) || !isset($_POST['partyId']) || !isset($_POST['access_token']) || !isset($_POST['refresh_token']) || !isset($_POST['token_expires_at']) || !isset($_POST['explicit'])) {
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

      $stmt = $conn->prepare("INSERT INTO parties (host_spotify_id, party_id, access_token, refresh_token, token_expires_at, party_expires_at, explicit) VALUES (?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("sssssss", $_POST['hostId'], $partyId, $_POST['access_token'], $_POST['refresh_token'], $_POST['token_expires_at'], $_POST['party_expires_at'], $_POST['explicit']);
      $stmt->execute();

      http_response_code(200);
      echo json_encode(array('success' => true));
   } elseif ($_POST['type'] === 'updatePartyExplicit') {
      if (!isset($_POST['hostId']) || !isset($_POST['explicit'])) {
         http_response_code(400);
         exit();
      }
      $stmt = $conn->prepare("UPDATE parties SET explicit = ? WHERE host_spotify_id = ?");
      $stmt->bind_param("ss", $_POST['explicit'], $_POST['hostId']);
      $stmt->execute();

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         exit();
      }

      http_response_code(200);
      echo json_encode(array('success' => true));
   } elseif ($_POST['type'] === 'deleteParty') {
      if (!isset($_POST['hostId'])) {
         http_response_code(400);
         exit();
      }
      $stmt = $conn->prepare("DELETE FROM parties WHERE host_spotify_id = ?");
      $stmt->bind_param("s", $_POST['hostId']);
      $stmt->execute();

      $stmt = $conn->prepare("SELECT * FROM parties WHERE host_spotify_id = ?");
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
   } else {
      http_response_code(400);
   }
} else {
   http_response_code(response_code: 405);
}

$conn->close();
