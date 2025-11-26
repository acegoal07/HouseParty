<?php
include __DIR__ . '/../../secrets.php';
include __DIR__ . '/../../util/sessionManager.php';
include __DIR__ . '/../../util/checkOrigin.php';
include __DIR__ . '/../../util/parseInput.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

class SessionInfo
{
   private $conn;
   private $input;

   public function __construct()
   {
      $this->conn = $GLOBALS['conn'];
      $this->input = parseInput($this->conn);
      checkOrigin();
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   public function handleRequest()
   {
      $sessionToken = $_COOKIE['session_id'] ?? '';

      if (empty($sessionToken)) {
         http_response_code(200);
         echo "event: noSessionId\n";
         echo "data: " . json_encode(['error' => 'Unauthorized: No session token provided']) . "\n\n";
         exit();
      }

      $pastResults = null;
      $initialRun = true;

      while (!connection_aborted()) {
         $results = validateSessionGetInfo($this->conn, $sessionToken);

         if (!$results['validated']) {
            echo "event: invalidSessionId\n";
            echo "data: {}\n\n";
            ob_flush();
            flush();
            break;
         }

         switch ($this->input['datalevel']) {
            case 'minimal':
               if ($initialRun) {
                  echo "event: init\n";
                  echo "data: " . json_encode([
                     'active_party' => $results['active_party'],
                  ]) . "\n\n";
                  $initialRun = false;
                  break;
               }

               if ($results['active_party'] !== $pastResults['active_party']) {
                  echo "event: partyStatusChange\n";
                  echo "data: " . json_encode([
                     'active_party' => $results['active_party'],
                  ]) . "\n\n";
               }

               break;
            case 'full':
               if ($initialRun) {
                  echo "event: init\n";
                  echo "data: " . json_encode([
                     'active_party' => $results['active_party'],
                     'party' => $results['party'],
                  ]) . "\n\n";
                  $initialRun = false;
                  break;
               }

               if ($results['active_party'] !== $pastResults['active_party']) {
                  echo "event: partyStatusChange\n";
                  echo "data: " . json_encode([
                     'active_party' => $results['active_party'],
                     'party' => $results['party'],
                  ]) . "\n\n";
               }

               if ($results['party'] !== $pastResults['party']) {
                  echo "event: partyUpdate\n";
                  echo "data: " . json_encode([
                     'active_party' => $results['active_party'],
                     'party' => $results['party'],
                  ]) . "\n\n";
               }

               break;
            default:
               if ($initialRun) {
                  echo "event: init\n";
                  echo "data: {}\n\n";
                  $initialRun = false;
                  break;
               }
               break;
         }

         echo ":\n\n";
         ob_flush();
         flush();

         $pastResults = $results;

         sleep(2);
      }
   }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
   http_response_code(405);
   echo json_encode(['error' => 'Method not allowed']);
   exit();
}

$sessionInfo = new SessionInfo();
$sessionInfo->handleRequest();
