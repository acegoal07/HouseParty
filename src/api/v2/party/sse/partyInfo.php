<?php
include __DIR__ . '/../../secrets.php';
include __DIR__ . '/../../util/sessionManager.php';
include_once __DIR__ . '/../../util/cookieManager.php';
include __DIR__ . '/../../util/checkOrigin.php';
include __DIR__ . '/../../util/parseInput.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

// If browser sends an option return info
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

// Check if the request method is valid
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
   http_response_code(405);
   echo json_encode([
      'success' => false,
      'error' => [
         'type' => 'forbiddenMethod',
         'message' => 'Method not allowed'
      ]
   ]);
   exit();
}

class PartyInfo
{
   private $conn;
   private $input;
   public function __construct()
   {
      checkOrigin();
      $this->conn = $GLOBALS['conn'];
      $this->input = parseInput($this->conn);
      $this->handleRequest();
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   private function handleRequest()
   {
      $partyId = $this->input['party_id'];

      if (empty($partyId)) {
         http_response_code(400);
         echo "event: noPartyId\n";
         echo "data: " . json_encode([
            'success' => false,
            'error' => [
               'type' => 'badRequest',
               'message' => 'party_id is required'
            ]
         ] . "\n\n");
         exit();
      }

      $loggedIn = false;
      $sessionId = cookieGet('session_id');

      if (!empty($sessionId)) {
         $loggedIn = true;
      }

      $pastResults = null;
      $initialRun = true;

      while (!connection_aborted()) {
         if ($loggedIn) {
            if (!validateSession($this->conn, $sessionId)['validated']) {
               $loggedIn = false;
            }
         }

         $stmt = $this->conn->prepare("SELECT explicit FROM parties WHERE party_id = ? COLLATE latin1_bin");
         $stmt->bind_param("s", $partyId);
         $stmt->execute();

         if ($stmt->error) {
            http_response_code(500);
            echo "event: serverError\n";
            echo "data: {}\n\n";
            $stmt->close();
            exit();
         }

         $results = $stmt->get_result();
         $row = $results->fetch_assoc();
         $stmt->close();

         if ($initialRun) {
            echo "event: init\n";
            echo "data: " . json_encode([
               "active_party" => $results->num_rows > 0,
               "party" => $row
            ]) . "\n\n";
            $initialRun = false;
         } else {
            if ($pastResults !== $row) {
               if (($results->num_rows > 0) !== ($pastResults !== null)) {
                  echo "event: partyUpdate\n";
                  echo "data: " . json_encode([
                     "type" => 'partyStatusChange',
                     "explicit" => $row['explicit']
                  ]) . "\n\n";
                  break;
               }

               if ($row['explicit'] !== $pastResults['explicit']) {
                  echo "event: partyUpdate\n";
                  echo "data: " . json_encode([
                     "type" => 'explicitUpdate',
                     "explicit" => $row['explicit']
                  ]) . "\n\n";
               }
            }
         }
         echo ":\n\n";
         ob_flush();
         flush();

         $pastResults = $row;

         sleep(2);
      }
   }
}

new PartyInfo();
