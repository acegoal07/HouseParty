<?php
require_once __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Retrieves the information about the party from the database
 * @param mixed $conn Database connection
 * @param string $partyId Party ID
 * @throws Exception on database error
 * @return array{access_token: string, duplicate_blocker: bool, explicit: bool}
 */
function getPartyInfo($conn, $partyId)
{
   $stmt = $conn->prepare("SELECT access_token, explicit, duplicate_blocker FROM parties WHERE party_id = ? COLLATE latin1_bin");
   $stmt->bind_param("s", $partyId);
   $stmt->execute();
   $result = $stmt->get_result();
   $row = $result->fetch_assoc();

   if ($stmt->error) {
      $stmt->close();
      http_response_code(500);
      echo json_encode([
         'success' => false,
         'error' => [
            'type' => 'database',
            'message' => $stmt->error
         ]
      ]);
      exit();
   }

   $stmt->close();

   if ($result->num_rows === 0) {
      $stmt->close();
      http_response_code(404);
      echo json_encode([
         'success' => false,
         'error' => [
            'type' => 'noParty',
            'message' => 'Party not found'
         ]
      ]);
      exit();
   }

   return [
      'access_token' => "Authorization: Bearer " . $row['access_token'],
      'explicit' => (bool) $row['explicit'],
      'duplicate_blocker' => (bool) $row['duplicate_blocker']
   ];
}
