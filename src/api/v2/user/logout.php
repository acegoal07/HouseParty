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

class Logout
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

      deleteSession($this->conn, $_COOKIE['session_id']);

      cookieDelete('session_id');

      http_response_code(200);
      echo json_encode(['message' => 'Successfully logged out']);
      exit();
   }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
   http_response_code(405);
   echo json_encode(['error' => 'Method not allowed']);
   exit();
}

$logout = new Logout();
$logout->handleRequest();
