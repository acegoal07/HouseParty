<?php
include 'databaseConnection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if ($_GET['type'] === 'partyExists') {
      $stmt = $conn->prepare("SELECT explicit, party_id FROM parties WHERE host_spotify_id = ?");
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
   }
}
