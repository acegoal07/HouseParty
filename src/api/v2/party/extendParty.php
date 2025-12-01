<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/sessionManager.php';
include_once __DIR__ . '/../util/cookieManager.php';
include __DIR__ . '/../util/checkOrigin.php';
include __DIR__ . '/../util/parseInput.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

class ExtendParty
{
   private $conn;
   private $input;

   public function __construct()
   {
      checkOrigin();
      $this->conn = $GLOBALS['conn'];
      $this->input = parseInput();
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   public function handleRequest()
   {
      $sessionId = cookieGet('session_id');

      if (empty($sessionId)) {
         http_response_code(401);
         echo json_encode(['success' => false, 'error' => 'Unauthorized: No session token provided']);
         exit();
      }

      $validation = validateSession($this->conn, $sessionId);

      if (!$validation['validated']) {
         http_response_code(401);
         echo json_encode(['success' => false, 'error' => 'Unauthorized: Invalid session']);
         exit();
      }

      $hours = (int)$this->input['hours'] ?? null;

      if (!is_int($hours) || $hours <= 0) {
         http_response_code(400);
         echo json_encode(['success' => false, 'error' => 'Bad Request: hours must be a positive integer']);
         exit();
      }

      $stmt = $this->conn->prepare("UPDATE parties p JOIN sessions s ON p.host_id = s.host_id SET p.party_expires_at = DATE_ADD(p.party_expires_at, INTERVAL ? HOUR) WHERE s.session_id = ? COLLATE latin1_bin");
      $stmt->bind_param('is', $hours, $sessionId);
      $stmt->execute();

      if ($stmt->error) {
         $stmt->close();
         http_response_code(500);
         echo json_encode(['success' => false, 'error' => "Database error: {$stmt->error}"]);
         throw new Exception("Database error: {$stmt->error}");
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true, 'message' => 'Party extended successfully']);
      exit();
   }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
   http_response_code(405);
   echo json_encode(['success' => false, 'error' => 'Method not allowed']);
   exit();
}

$extendParty = new ExtendParty();
$extendParty->handleRequest();
