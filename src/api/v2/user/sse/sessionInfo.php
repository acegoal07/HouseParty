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
   echo "event: forbiddenMethod";
   echo "data : " . json_encode([
      'error' => [
         'type' => 'forbiddenMethod',
         'message' => 'Method not allowed'
      ]
   ]) . "\n\n";
   exit();
}

class SessionInfo
{
   private $conn;
   private $input;

   public function __construct()
   {
      checkOriginSSE();
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
      $sessionId = cookieGet('session_id');

      if (empty($sessionId)) {
         echo "event: noSessionId\n";
         echo "data: " . json_encode([
            'error' => [
               'type' => 'unauthorized',
               'message' => 'No session id provided'
            ]
         ]) . "\n\n";
         exit();
      }

      $dataLevel = $this->input['datalevel'] ?? 'none';

      $pastResults = null;
      $initialRun = true;

      while (!connection_aborted()) {
         $results = validateSession($this->conn, $sessionId, $dataLevel);

         if (!$results) {
            echo "event: serverError\n";
            echo "data: {}\n\n";
            ob_flush();
            flush();
            exit();
         }

         if (!$results['validated']) {
            echo "event: invalidSessionId\n";
            echo "data: " . json_encode([
               'error' => [
                  'type' => 'unauthorized',
                  'message' => 'Invalid session'
               ]
            ]) . "\n\n";
            ob_flush();
            flush();
            exit();
         }

         switch ($dataLevel) {
            case 'full':
               if ($initialRun) {
                  echo "event: init\n";
                  echo "data: " . json_encode([
                     'active_party' => $results['active_party'],
                     'party' => $results['party']
                  ]) . "\n\n";
                  $initialRun = false;
                  break;
               }

               if ($results['party'] !== $pastResults['party']) {
                  if ($results['active_party'] !== $pastResults['active_party']) {
                     echo "event: partyUpdate\n";
                     echo "data: " . json_encode([
                        'type' => 'partyStatusChange',
                        'active_party' => $results['active_party']
                     ]) . "\n\n";
                     break;
                  }

                  if ($results['party']['party_id'] !== $pastResults['party']['party_id']) {
                     echo "event: partyUpdate\n";
                     echo "data: " . json_encode([
                        'type' => 'partyIdUpdate',
                        'party_id' => $results['party']['party_id']
                     ]) . "\n\n";
                  }

                  if ($results['party']['party_expires_at'] !== $pastResults['party']['party_expires_at']) {
                     echo "event: partyUpdate\n";
                     echo "data: " . json_encode([
                        'type' => 'partyExpiresAtUpdate',
                        'party_expires_at' => $results['party']['party_expires_at']
                     ]) . "\n\n";
                  }

                  if ($results['party']['duplicate_blocker'] !== $pastResults['party']['duplicate_blocker']) {
                     echo "event: partyUpdate\n";
                     echo "data: " . json_encode([
                        'type' => 'duplicateBlockerUpdate',
                        'duplicate_blocker' => $results['party']['duplicate_blocker']
                     ]) . "\n\n";
                  }

                  if ($results['party']['explicit'] !== $pastResults['party']['explicit']) {
                     echo "event: partyUpdate\n";
                     echo "data: " . json_encode([
                        'type' => 'explicitUpdate',
                        'explicit' => $results['party']['explicit']
                     ]) . "\n\n";
                  }
               }
               break;
            case 'minimal':
               if ($initialRun) {
                  echo "event: init\n";
                  echo "data: " . json_encode([
                     'active_party' => $results['active_party']
                  ]) . "\n\n";
                  $initialRun = false;
                  break;
               }

               if ($results['active_party'] !== $pastResults['active_party']) {
                  echo "event: partyUpdate\n";
                  echo "data: " . json_encode([
                     'type' => 'partyStatusChange',
                     'active_party' => $results['active_party']
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

new SessionInfo();
