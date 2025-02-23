<?php
header("Access-Control-Allow-Origin: https://aw1443.brighton.domains/");
header("Access-Control-Allow-Methods: GET");

include '../secrets.php';

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
    * Handle the request
    * @return void
    */
   public function handleRequest()
   {
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
    * Process the login request
    * @return void
    */
   private function processLogin()
   {
      $result = $this->getAccessToken();
      $stored_refresh_token = $result['refresh_token'];

      $result = $this->getHostId($result['access_token']);

      if (!isset($result['id'])) {
         $this->redirectWithError(1);
      }

      if ($result['product'] !== 'premium') {
         $this->redirectWithError(3);
      }

      setcookie("host_id", $result['id'], time() + 86400, "/", "", true);

      $final_refresh_token = $this->checkRefreshToken($result['id'], $stored_refresh_token);

      setcookie("refresh_token", $final_refresh_token, time() + 86400, "/", "", true);

      header("Location: ../../../dashboard.html");
      exit();
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
         'redirect_uri' => 'https://aw1443.brighton.domains/houseparty/assets/php/website/spotifyLogin.php',
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
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
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
    * Check if the refresh token has changed and update it if necessary
    * @param string $hostId The host ID
    * @param string $stored_refresh_token The stored refresh token
    * @return string The final refresh token
    */
   private function checkRefreshToken($hostId, $stored_refresh_token)
   {
      $stmt = $this->conn->prepare("SELECT refresh_token FROM parties WHERE host_id = ? COLLATE utf8_bin");
      $stmt->bind_param("s", $hostId);
      $stmt->execute();

      if ($stmt->error) {
         setcookie("host_id", "", time() - 3600, "/", "", true);
         $this->redirectWithError(1);
      }

      $query_result = $stmt->get_result();
      $final_refresh_token = $stored_refresh_token;

      if ($query_result->num_rows > 0) {
         $row = $query_result->fetch_assoc();
         if ($row['refresh_token'] !== $stored_refresh_token) {
            $final_refresh_token = $row['refresh_token'];
         }
      }

      $stmt->close();

      return $final_refresh_token;
   }

   /**
    * Redirect the user to the login error page with an error code
    * @param int $errorCode The error code
    * @return void
    */
   private function redirectWithError($errorCode)
   {
      header("Location: ../../../loginerror.html?error=$errorCode");
      exit();
   }

   /**
    * Destructor
    */
   public function __destruct()
   {
      $this->conn->close();
   }
}

$spotifyLoginHandler = new SpotifyLoginHandler($conn, $spotifyClientId, $spotifyClientSecret);
$spotifyLoginHandler->handleRequest();
