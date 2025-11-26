<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/sessionManager.php';
include __DIR__ . '/../util/checkOrigin.php';
include __DIR__ . '/../util/parseInput.php';
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
      if (empty($_COOKIE['session_id'] ?? '')) {
         http_response_code(401);
         echo json_encode(['error' => 'Unauthorized: No session id provided']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT p.party_id FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE s.session_id = ?");
      $stmt->bind_param('s', $_COOKIE['session_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => "Database error: {$stmt->error}"]);
         throw new Exception("Database error: {$stmt->error}");
      }

      $result = $stmt->get_result();

      http_response_code(200);
      echo json_encode([
         'has_active_party' => $result->num_rows > 0,
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
   echo json_encode(['error' => 'Method not allowed']);
   exit();
}

$hasParty = new HasParty();
$hasParty->handleRequest();
