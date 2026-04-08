<?php
include '../secrets.php';
include '../util/session.php';
include '../util/cookie.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: GET");

class SpotifyLoginHandler
{
   private $conn;
   private $spotifyClientId;
   private $spotifyClientSecret;

   /**
    * Constructor
    * @param mysqli $conn The database connection
    * @param string $spotifyClientId The Spotify client ID
    * @param string $spotifyClientSecret The Spotify client secret
    */
   public function __construct($conn, $spotifyClientId, $spotifyClientSecret)
   {
      $this->conn = $conn;
      $this->spotifyClientId = $spotifyClientId;
      $this->spotifyClientSecret = $spotifyClientSecret;
   }

   /**
    * Redirect the user to the login error page with an error code
    * @param int $errorCode The error code
    * @return void
    */
   private function redirectWithError($errorCode)
   {
      header("Location: /loginerror.html?error=$errorCode");
      exit();
   }

   /**
    * Handle the request
    * @return void
    */
   public function handleRequest()
   {
      if (!isset($_SERVER['REQUEST_METHOD'])) {
         http_response_code(405);
         echo json_encode(['error' => 'Bad Request: Missing request method']);
         exit();
      }
      if ($_SERVER['REQUEST_METHOD'] === 'GET') {
         if (isset($_GET['error'])) {
            $this->redirectWithError(1);
         } else {
            $this->processLogin();
         }
      } else {
         http_response_code(405);
         exit();
      }
   }

   /**
    * Get the access token from the Spotify API
    * @return array The access token
    */
   private function getAccessToken()
   {
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://accounts.spotify.com/api/token");
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
         'grant_type' => 'authorization_code',
         'code' => $_GET['code'],
         'redirect_uri' => 'https://houseparty.acegoal07.dev/api/v1/website/spotifyLogin.php',
         'client_id' => $this->spotifyClientId,
         'client_secret' => $this->spotifyClientSecret
      ]));
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($ch);
      $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      if (curl_errno($ch)) {
         error_log('cURL Error: ' . curl_error($ch));
         $this->redirectWithError(1);
      }

      if ($http_code === 429) {
         $this->redirectWithError(4);
      } elseif ($http_code !== 200) {
         $this->redirectWithError(1);
      }

      return json_decode($response, true);
   }

   /**
    * Get the host ID from the Spotify API
    * @param string $accessToken The access token
    * @return array The host ID
    */
   private function getHostId($accessToken)
   {
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/me");
      curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$accessToken}"]);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($ch);
      $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      if (curl_errno($ch)) {
         error_log('cURL Error: ' . curl_error($ch));
         $this->redirectWithError(1);
      }

      if ($http_code === 429) {
         $this->redirectWithError(4);
      } elseif ($http_code === 403) {
         $this->redirectWithError(2);
      } elseif ($http_code !== 200) {
         $this->redirectWithError(1);
      }

      return json_decode($response, true);
   }

   /**
    * Process the login request
    * @return void
    */
   private function processLogin()
   {
      $result = $this->getAccessToken();
      $refresh_token = $result['refresh_token'];

      $result = $this->getHostId($result['access_token']);

      if (!isset($result['id'])) {
         $this->redirectWithError(1);
      }

      if ($result['product'] !== 'premium') {
         $this->redirectWithError(3);
      }

      $hashed_host_id = hash('sha256', $result['id']);

      createSession($this->conn, $hashed_host_id, $refresh_token);

      header("Location: /create.html");
      exit();
   }
}

$spotifyLoginHandler = new SpotifyLoginHandler($conn, $spotifyClientId, $spotifyClientSecret);
$spotifyLoginHandler->handleRequest();
$conn->close();
