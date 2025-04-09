<?php
include '../secrets.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: POST, GET");

class DatabasePartyHandlers
{
   private $conn;
   private $allowedDomain;
   private $spotifyClientId;
   private $spotifyClientSecret;

   /**
    * Constructor
    * @param mysqli $conn The database connection
    * @param string $spotifyClientId The Spotify client ID
    * @param string $spotifyClientSecret The Spotify client secret
    */
   public function __construct($conn, $allowedDomain, $spotifyClientId, $spotifyClientSecret)
   {
      $this->conn = $conn;
      $this->allowedDomain = $allowedDomain;
      $this->spotifyClientId = $spotifyClientId;
      $this->spotifyClientSecret = $spotifyClientSecret;
      $this->checkOrigin();
   }

   /**
    * Destructor
    */
   public function __destruct()
   {
      $this->conn->close();
   }

   /**
    * Check the origin of the request
    */
   private function checkOrigin()
   {
      $referer = $_SERVER['HTTP_REFERER'] ?? '';
      $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

      if (strpos($referer, $this->allowedDomain) !== 0 && strpos($origin, $this->allowedDomain) !== 0) {
         http_response_code(403);
         echo json_encode(['error' => 'Forbidden']);
         exit();
      }
   }

   /**
    * Verify that the refresh token matches the expected format
    * @param string $refreshToken The refresh token to verify
    * @return bool True if the refresh token is valid, false otherwise
    */
   private function verifyRefreshToken($refreshToken)
   {
      $pattern = '/^[A-Za-z0-9-_]{40,}$/';
      return preg_match($pattern, $refreshToken) === 1;
   }

   /**
    * Generate a random party ID
    * @return string The generated party ID
    */
   private function generatePartyId()
   {
      $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      $charactersLength = strlen($characters);
      $randomString = '';
      for ($i = 0; $i < 6; $i++) {
         $randomString .= $characters[rand(0, $charactersLength - 1)];
      }
      return $randomString;
   }

   /**
    * Handle the request
    */
   public function handleRequest()
   {
      if ($_SERVER['REQUEST_METHOD'] === 'GET') {
         if (!isset($_GET['type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Missing type parameter']);
            exit();
         }
         $this->handleGetRequest();
      } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
         if (!isset($_POST['type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Missing type parameter']);
            exit();
         }
         $this->handlePostRequest();
      } else {
         http_response_code(405);
         echo json_encode(['error' => 'Method Not Allowed']);
         exit();
      }
   }

   /**
    * Handle GET requests
    */
   private function handleGetRequest()
   {
      switch ($_GET['type']) {
         case 'checkPartyExistsHost':
            $this->checkPartyExistsHost();
            break;
         case 'checkPartyExistsUser':
            $this->checkPartyExistsUser();
            break;
         default:
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Invalid GET type']);
            exit();
      }
   }

   /**
    * Handle POST requests
    */
   private function handlePostRequest()
   {
      switch ($_POST['type']) {
         case 'createParty':
            $this->createParty();
            break;
         case 'deleteParty':
            $this->deleteParty();
            break;
         case 'updatePartyExplicit':
            $this->updatePartyExplicit();
            break;
         case 'updatePartyDuplicateBlocker':
            $this->updatePartyDuplicateBlocker();
            break;
         case 'extendPartyDuration':
            $this->extendPartyDuration();
            break;
         default:
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Invalid POST type']);
            exit();
      }
   }

   /**
    * Check if a party exists for a host
    */
   private function checkPartyExistsHost()
   {
      if (!isset($_GET['hostId']) || !isset($_GET['refreshToken'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT explicit, duplicate_blocker, party_id, party_expires_at, refresh_token FROM parties WHERE host_id = ? COLLATE utf8_bin");
      $stmt->bind_param("s", $_GET['hostId']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $result = $stmt->get_result();

      http_response_code(200);
      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         if ($row['refresh_token'] !== $_GET['refreshToken']) {
            echo json_encode(['partyExists' => true, 'refreshTokenValid' => false]);
            exit();
         }
         echo json_encode(['partyExists' => true, 'refreshTokenValid' => true, 'explicit' => $row['explicit'], 'duplicateBlocker' => $row['duplicate_blocker'], 'partyId' => $row['party_id'], 'partyExpiresAt' => $row['party_expires_at']]);
      } else {
         echo json_encode(['partyExists' => false, 'refreshTokenValid' => false]);
      }
      exit();
   }

   /**
    * Check if a party exists for a user
    */
   private function checkPartyExistsUser()
   {
      if (!isset($_GET['partyId'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT explicit FROM parties WHERE party_id = ? COLLATE utf8_bin");
      $stmt->bind_param("s", $_GET['partyId']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $result = $stmt->get_result();

      http_response_code(200);
      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         echo json_encode(['partyExists' => true, 'explicit' => $row['explicit']]);
      } else {
         echo json_encode(['partyExists' => false]);
      }
      exit();
   }

   /**
    * Create a party
    */
   private function createParty()
   {
      if (!isset($_POST['hostId']) || !isset($_POST['refreshToken']) || !isset($_POST['partyEndsIn']) || !isset($_POST['explicit']) || !isset($_POST['duplicateBlocker'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      if (!$this->verifyRefreshToken($_POST['refreshToken'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid refresh token']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT * FROM parties WHERE host_id = ? COLLATE utf8_bin");
      $stmt->bind_param("s", $_POST['hostId']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $result = $stmt->get_result();

      if ($result->num_rows > 0) {
         http_response_code(400);
         echo json_encode(['success' => false]);
         exit();
      }

      $partyId = $this->generatePartyId();
      $stmt = $this->conn->prepare("SELECT * FROM parties WHERE party_id = ? COLLATE utf8_bin");
      $stmt->bind_param("s", $partyId);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $result = $stmt->get_result();

      while ($result->num_rows > 0) {
         $partyId = $this->generatePartyId();
         $stmt->execute();
         $result = $stmt->get_result();
      }

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://accounts.spotify.com/api/token");
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['grant_type' => 'refresh_token', 'refresh_token' => $_POST['refreshToken'], 'client_id' => $this->spotifyClientId]));
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded', 'Authorization: Basic ' . base64_encode("{$this->spotifyClientId}:{$this->spotifyClientSecret}")]);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($ch);
      $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      if ($responseCode === 403) {
         http_response_code(403);
         echo json_encode(['error' => 'Invalid refresh token']);
         exit();
      }

      if (curl_errno($ch)) {
         http_response_code(500);
         echo json_encode(['error' => curl_error($ch)]);
         exit();
      }

      $result = json_decode($response, true);

      $timezone = new DateTimeZone('Europe/London');
      date_default_timezone_set($timezone->getName());
      $timestamp_formatted = 'Y-m-d H:i:s';

      $accessToken = $result['access_token'];

      $tokenExpiresAt = new DateTime();
      $tokenExpiresAt->setTimezone($timezone);
      $tokenExpiresAt->setTimestamp(time() + 3600);
      $tokenExpiresAtFormatted = $tokenExpiresAt->format($timestamp_formatted);

      $partyExpiresAt = new DateTime();
      $partyExpiresAt->setTimezone($timezone);
      $partyExpiresAt->setTimestamp(time() + $_POST['partyEndsIn'] * 3600);
      $partyExpiresAtFormatted = $partyExpiresAt->format($timestamp_formatted);

      $stmt = $this->conn->prepare("INSERT INTO parties (party_id, host_id, access_token, refresh_token, party_expires_at, token_expires_at, explicit, duplicate_blocker) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("ssssssss", $partyId, $_POST['hostId'], $accessToken, $_POST['refreshToken'], $partyExpiresAtFormatted, $tokenExpiresAtFormatted, $_POST['explicit'], $_POST['duplicateBlocker']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Delete a party
    */
   private function deleteParty()
   {
      if (!isset($_POST['hostId']) || !isset($_POST['refreshToken'])) {
         http_response_code(400);
         exit();
      }

      $stmt = $this->conn->prepare("DELETE FROM parties WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
      $stmt->bind_param("ss", $_POST['hostId'], $_POST['refreshToken']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No rows affected']);
         exit();
      }

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Update the explicit setting for a party
    */
   private function updatePartyExplicit()
   {
      if (!isset($_POST['hostId']) || !isset($_POST['refreshToken'])  || !isset($_POST['explicit'])) {
         http_response_code(400);
         exit();
      }

      $stmt = $this->conn->prepare("UPDATE parties SET explicit = ? WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
      $stmt->bind_param("sss", $_POST['explicit'], $_POST['hostId'], $_POST['refreshToken']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No rows affected']);
         exit();
      }

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Update the duplicate blocker setting for a party
    */
   private function updatePartyDuplicateBlocker()
   {
      if (!isset($_POST['hostId']) || !isset($_POST['refreshToken'])  || !isset($_POST['duplicateBlocker'])) {
         http_response_code(400);

         exit();
      }

      $stmt = $this->conn->prepare("UPDATE parties SET duplicate_blocker = ? WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
      $stmt->bind_param("sss", $_POST['duplicateBlocker'], $_POST['hostId'], $_POST['refreshToken']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No rows affected']);
         exit();
      }

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Extend the duration of a party
    */
   private function extendPartyDuration()
   {
      if (!isset($_POST['hostId']) || !isset($_POST['refreshToken']) || !isset($_POST['extendBy'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT party_expires_at FROM parties WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
      $stmt->bind_param("ss", $_POST['hostId'], $_POST['refreshToken']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $result = $stmt->get_result();

      if ($result->num_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No party found']);
         exit();
      }

      $row = $result->fetch_assoc();
      $partyExpiresAt = new DateTime($row['party_expires_at']);
      $partyExpiresAtSeconds = $partyExpiresAt->getTimestamp() + $_POST['extendBy'] * 3600;
      $partyExpiresAt->setTimestamp($partyExpiresAtSeconds);
      $partyExpiresAtFormatted = $partyExpiresAt->format('Y-m-d H:i:s');

      $stmt = $this->conn->prepare("UPDATE parties SET party_expires_at = ? WHERE host_id = ? COLLATE utf8_bin AND refresh_token = ? COLLATE utf8_bin");
      $stmt->bind_param("sss", $partyExpiresAtFormatted, $_POST['hostId'], $_POST['refreshToken']);
      $stmt->execute();

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No rows affected']);
         exit();
      }

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }
}

$api = new DatabasePartyHandlers($conn, $allowedDomain, $spotifyClientId, $spotifyClientSecret);
$api->handleRequest();
