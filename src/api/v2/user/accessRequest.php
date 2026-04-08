<?php
require_once __DIR__ . '/../secrets.php';
require_once __DIR__ . '/../util/checkOrigin.php';
require_once __DIR__ . '/../util/parseInput.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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
      'error' => [
         'type' => 'forbiddenMethod',
         'message' => 'Method not allowed'
      ]
   ]);
   exit();
}

class AccessRequest
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
      $email = $this->input['email'] ?? '';

      if (empty($email)) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'badRequest',
               'message' => 'email must be provided'
            ]
         ]);
         exit();
      }

      $email = urldecode($email);

      $name = $this->input['name'] ?? '';

      if (empty($name)) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'badRequest',
               'message' => 'name must be provided'
            ]
         ]);
         exit();
      }

      $name = urldecode($name);

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_URL, $GLOBALS['requestAccessWebhook']);
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['content' => "``email:``{$email}\n``name:``{$name}"]));

      curl_exec($ch);

      http_response_code(200);
      echo json_encode([
         'success' =>  true
      ]);
      exit();
   }
}

new AccessRequest();
