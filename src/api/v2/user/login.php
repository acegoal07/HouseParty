<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/sessionManager.php';
include __DIR__ . '/../util/parseInput.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: GET");

// If browser sends an option return info
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

// Check if the request method is valid
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
   http_response_code(405);
   echo json_encode([
      'error' => [
         'type' => 'forbiddenMethod',
         'message' => 'Method not allowed'
      ]
   ]);
   exit();
}

class Login
{
   private $conn;
   private $input;

   public function __construct()
   {
      $this->conn = $GLOBALS['conn'];
      $this->input = parseInput($this->conn);
      $this->handleRequest();
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   /**
    * Redirect the user to the login error page with an error code
    * @param "unknown"|"rateLimitReached"|"notAuthorised"|"premiumAccountRequired" $errorCode The error code
    * @return void
    */
   private function redirectWithError($errorCode)
   {
      header("Location: /loginerror.html?error=$errorCode");
      exit();
   }

   private function handleRequest()
   {
      $code = $this->input['code'] ?? '';

      if (empty($code)) {
         return $this->redirectWithError('unknown');
      }

      // Get users access token
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://accounts.spotify.com/api/token");
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
         'grant_type' => 'authorization_code',
         'code' => $code,
         'redirect_uri' => 'https://houseparty.acegoal07.dev/api/v2/user/login.php',
         'client_id' => $GLOBALS['spotifyClientId'],
         'client_secret' => $GLOBALS['spotifyClientSecret']
      ]));
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      $response = curl_exec($ch);

      if (!$response || curl_errno($ch)) {
         return $this->redirectWithError('unknown');
      }

      $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

      if ($responseCode === 429) {
         return $this->redirectWithError('unknown');
      }

      $responseData = json_decode($response, true);

      $refreshToken = $responseData['refresh_token'] ?? '';
      $accessToken = $responseData['access_token'] ?? '';

      if (empty($refreshToken) || empty($accessToken)) {
         return $this->redirectWithError('unknown');
      }

      // Get users id and check their account for access
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/me");
      curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$accessToken}"]);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      $response = curl_exec($ch);

      if (!$response || curl_errno($ch)) {
         return $this->redirectWithError('unknown');
      }

      $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

      if ($responseCode === 429) {
         return $this->redirectWithError('rateLimitReached');
      } elseif ($responseCode === 403) {
         return $this->redirectWithError('notAuthorised');
      }

      $responseData = json_decode($response, true);

      if (!isset($responseData['id'])) {
         return $this->redirectWithError('unknown');
      } elseif ($responseData['product'] !== 'premium') {
         return $this->redirectWithError('premiumAccountRequired');
      }

      // Create session and login user
      createSession($this->conn, hash('sha256', $responseData['id']), $refreshToken);

      // Go to create page
      header("Location: /create.html");
      exit();
   }
}

new Login();
