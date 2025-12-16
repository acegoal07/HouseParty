<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/sessionManager.php';
include_once __DIR__ . '/../util/cookieManager.php';
include __DIR__ . '/../util/checkOrigin.php';
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

class Logout
{
   private $conn;

   public function __construct()
   {
      checkOrigin();
      $this->conn = $GLOBALS['conn'];
      $this->handleRequest();
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   private function handleRequest()
   {
      // Get session id and check to make sure the id exists
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

      // Validate the session id to make sure its a valid user session id
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

      deleteSession($this->conn, $sessionId);

      cookieDelete('session_id');

      http_response_code(200);
      echo json_encode([
         'success' => true
      ]);
      exit();
   }
}

new Logout();
