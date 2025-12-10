<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/sessionManager.php';
include_once __DIR__ . '/../util/cookieManager.php';
include __DIR__ . '/../util/checkOrigin.php';
include __DIR__ . '/../util/parseInput.php';
include __DIR__ . '/../util/generatePartyId.php';
include __DIR__ . '/../util/getAccessToken.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// If browser sends an option return info
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

// Check if the request method is valid
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

class CreateParty
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
      $sessionId = cookieGet('session_id');

      if (empty($sessionId)) {
         http_response_code(401);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'unauthorized',
               'message' => 'No session id provided'
            ]
         ]);
         exit();
      }

      $validation = validateSession($this->conn, $sessionId);

      if (!$validation['validated']) {
         http_response_code(401);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'unauthorized',
               'message' => 'Invalid session'
            ]
         ]);
         exit();
      }

      $duplicateBlocker = $this->input['duplicate_blocker'] ?? null;

      if (!is_bool($duplicateBlocker)) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'badRequest',
               'message' => 'duplicate_blocker must be a boolean',
               'debug' => $this->input
            ]
         ]);
         exit();
      }

      $explicit = $this->input['explicit'] ?? null;

      if (!is_bool($explicit)) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'badRequest',
               'message' => 'explicit must be a boolean'
            ]
         ]);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT count(*) FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE session_id = ?");
      $stmt->bind_param('s', $sessionId);
      $stmt->execute();
      $partyCount = 0;
      $stmt->bind_result($partyCount);
      $stmt->fetch();

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

      if ($partyCount > 0) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'activeParty',
               'message' => 'Host already has an active party'
            ]
         ]);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT u.host_id, u.refresh_token FROM users u JOIN sessions s ON u.host_id = s.host_id WHERE session_id = ? COLLATE latin1_bin");
      $stmt->bind_param('s', $sessionId);
      $stmt->execute();
      $hostId = '';
      $refreshToken = '';
      $stmt->bind_result($hostId, $refreshToken);
      $stmt->fetch();

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

      $partyId = generatePartyId($this->conn);
      $accessToken = getAccessToken($refreshToken);

      $tokenExpiresAt = gmdate('Y-m-d H:i:00',  time() + 3600);

      $partyExpiresAt = time() + $this->input['party_ends_in'] * 3600;
      $partyExpiresAt = (int) (round($partyExpiresAt / 60) * 60);
      $partyExpiresAt = gmdate('Y-m-d H:i:00', $partyExpiresAt);

      $stmt = $this->conn->prepare("INSERT INTO parties (party_id, host_id, access_token, party_expires_at, token_expires_at, explicit, duplicate_blocker) VALUES (?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("sssssii", $partyId, $hostId, $accessToken, $partyExpiresAt, $tokenExpiresAt, $explicit, $duplicateBlocker);
      $stmt->execute();

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

      http_response_code(200);
      echo json_encode([
         'success' => true
      ]);
      exit();
   }
}

new CreateParty();
