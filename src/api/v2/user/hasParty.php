<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/sessionManager.php';
include_once __DIR__ . '/../util/cookieManager.php';
include __DIR__ . '/../util/checkOrigin.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

class HasParty
{
   private $conn;

   public function __construct()
   {
      $this->conn = $GLOBALS['conn'];
      checkOrigin();
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
         echo json_encode(['success' => false, 'error' => 'Unauthorized: No session id provided']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT count(*) FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE s.session_id = ? COLLATE latin1_bin");
      $stmt->bind_param('s', $sessionId);
      $stmt->execute();
      $count = 0;
      $stmt->bind_result($count);
      $stmt->fetch();

      if ($stmt->error) {
         $stmt->close();
         http_response_code(500);
         echo json_encode(['success' => false, 'error' => "Database error: {$stmt->error}"]);
         throw new Exception("Database error: {$stmt->error}");
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode([
         'success' => true,
         'has_active_party' => $count > 0,
      ]);
      exit();
   }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
   http_response_code(405);
   echo json_encode(['success' => false, 'error' => 'Method not allowed']);
   exit();
}

$hasParty = new HasParty();
$hasParty->handleRequest();
