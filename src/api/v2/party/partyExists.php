<?php
include __DIR__ . '/../secrets.php';
include_once __DIR__ . '/../util/cookieManager.php';
include __DIR__ . '/../util/checkOrigin.php';
include __DIR__ . '/../util/parseInput.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

class PartyExists
{
   private $conn;
   private $input;

   public function __construct()
   {
      $this->conn = $GLOBALS['conn'];
      checkOrigin();
      $this->input = parseInput();
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   public function handleRequest()
   {
      $partyId = $this->input['party_id'] ?? '';

      if (empty($partyId)) {
         http_response_code(400);
         echo json_encode(['success' => false, 'error' => 'Bad Request: party_id is required']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT COUNT(*) FROM parties WHERE party_id = ?");
      $stmt->bind_param('s', $partyId);
      $stmt->execute();
      $count = 0;
      $stmt->bind_result($count);
      $stmt->fetch();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['success' => false, 'error' => "Database error: {$stmt->error}"]);
         throw new Exception("Database error: {$stmt->error}");
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true, 'party_exists' => $count > 0]);
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

$partyExists = new PartyExists();
$partyExists->handleRequest();
