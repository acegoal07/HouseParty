<?php
include '../secrets.php';
include '../util/session.php';
include '../util/cookie.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Short-circuit preflight
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

class DatabaseHandler
{
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  REFERENCES  ////////////////////////////////////////////////////////////////////////////////////////////

   private $conn;
   private $allowedDomain;
   private $spotifyClientId;
   private $spotifyClientSecret;
   private $input = [];

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  FUNCTIONS  /////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructor
    * @param mysqli $conn The database connection
    * @param string $allowedDomain The allowed domain for CORS
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
      $this->parseInput();
   }

   /**
    * Check the origin of the request
    */
   private function checkOrigin()
   {
      if (strpos($_SERVER['HTTP_REFERER'] ?? '', $this->allowedDomain) !== 0 && strpos($_SERVER['HTTP_ORIGIN'] ?? '', $this->allowedDomain) !== 0) {
         http_response_code(403);
         echo json_encode(['error' => 'Forbidden']);
         exit();
      }
   }

   /**
    * Handle the request
    */
   public function handleRequest()
   {
      if (!isset($_SERVER['REQUEST_METHOD'])) {
         http_response_code(405);
         echo json_encode(['error' => 'Bad Request: Missing request method']);
         exit();
      }

      if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
         http_response_code(405);
         echo json_encode(['error' => 'Method Not Allowed']);
         exit();
      }

      if (!isset($this->input['type'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Missing type parameter']);
         exit();
      }

      switch ($this->input['type']) {
         // Handle GET requests
         case 'validateSession':
            $this->validateSession();
            break;
         case 'validateParty':
            $this->validateParty();
            break;
         case 'validatePartyAndSession':
            $this->validatePartyAndSession();
            break;
         // Handle POST requests
         case 'logoutUser':
            $this->logoutUser();
            break;
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
         case 'generateNewPartyId':
            $this->generateNewPartyId();
            break;
         default:
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Invalid type parameter']);
            exit();
      }
   }

   /**
    * Parse input based on request method and content type
    */
   private function parseInput()
   {
      $method = $_SERVER['REQUEST_METHOD'] ?? '';

      if ($method === 'GET') {
         $this->input = $_GET;
      } elseif ($method === 'POST') {
         $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

         if (strpos($contentType, 'application/json') !== false) {
            $rawInput = file_get_contents('php://input');
            $this->input = json_decode($rawInput, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
               http_response_code(400);
               echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
               exit();
            }
         } else {
            $this->input = $_POST;
         }
      }

      $this->input = $this->sanitizeInput($this->input);
   }

   /**
    * Sanitize input data
    * @param mixed $data The input data
    * @return mixed The sanitized data
    */
   private function sanitizeInput($data)
   {
      if (is_array($data)) {
         return array_map([$this, 'sanitizeInput'], $data);
      }
      return is_string($data) ? $this->conn->real_escape_string($data) : $data;
   }

   /**
    * Generate a random party ID
    * @return string The generated party ID
    */
   private function generatePartyId()
   {
      $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      $randomString = '';
      for ($i = 0; $i < 6; $i++) {
         $randomString .= $characters[random_int(0, strlen($characters) - 1)];
      }
      return $randomString;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  GET REQUESTS  //////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Check if a users session id is valid and returns data about the user if it is depending on what's requested
    * @return mixed
    */
   private function validateSession()
   {
      if (!cookieExists('session_id')) {
         http_response_code(200);
         echo json_encode(['validated' => false]);
         exit();
      }

      if (!isset($this->input['party_data'])) {
         $this->input['party_data'] = 'false';
      }

      if (!isset($this->input['partial_data']))

      http_response_code(200);

      $validation = null;

      if ($this->input['party_data'] === 'true') {
         $validation = validateSessionGetInfo($this->conn, cookieGet('session_id'));
      } elseif ($this->input['partial_data'] === 'true') {
         $validation = validateSessionGetPartialInfo($this->conn, cookieGet('session_id'));
      } else {
         $validation = (validateSession($this->conn, cookieGet('session_id')));
      }

      if (!$validation['validated']) {
         cookieDelete('session_id');
      }

      echo json_encode($validation);

      exit();
   }

   /**
    * Check if a party exists
    * @return mixed
    */
   private function validateParty()
   {
      if (!isset($this->input['party_id'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT explicit FROM parties WHERE party_id = ? COLLATE latin1_bin");
      $stmt->bind_param("s", $this->input['party_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $result = $stmt->get_result();

      http_response_code(200);
      if ($result->num_rows > 0) {
         echo json_encode(['party_exists' => true]);
      } else {
         echo json_encode(['party_exists' => false]);
      }

      $stmt->close();
      exit();
   }

   /**
    * Check if a party exists and check session validation if session_id is provided
    * @return mixed
    */
   private function validatePartyAndSession()
   {
      if (!isset($this->input['party_id'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT explicit FROM parties WHERE party_id = ? COLLATE latin1_bin");
      $stmt->bind_param("s", $this->input['party_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $result = $stmt->get_result();

      $validation = null;
      if (cookieExists('session_id')) {
         $validation = validateSession($this->conn, cookieGet('session_id'));
         if (!$validation['validated']) {
            cookieDelete('session_id');
         }
      }

      http_response_code(200);
      if ($result->num_rows > 0) {
         $row = $result->fetch_assoc();
         echo json_encode(['party_exists' => true, 'explicit' => $row['explicit'], 'validated' => $validation ? $validation['validated'] : null]);
      } else {
         echo json_encode(['party_exists' => false]);
      }

      $stmt->close();
      exit();
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  POST REQUESTS  /////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Deletes the users active session
    * @return never
    */
   private function logoutUser()
   {
      if (!cookieExists('session_id')) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing session_id']);
         exit();
      }

      deleteSession($this->conn, cookieGet('session_id'));

      cookieDelete('session_id');

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Create a party
    * @return never
    */
   private function createParty()
   {
      if (!cookieExists('session_id') || !isset($this->input['party_ends_in']) || !isset($this->input['explicit']) || !isset($this->input['duplicate_blocker'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $validation = validateSessionGetInfo($this->conn, cookieGet('session_id'));
      if (!$validation['validated']) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid session ID']);
         exit();
      }

      $party_data = $validation['parties'][0];

      $stmt = $this->conn->prepare("SELECT * FROM parties WHERE host_id = ? COLLATE latin1_bin LIMIT 1");
      $stmt->bind_param("s", $party_data['host_id']);
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

      $stmt->close();

      $partyId = $this->generatePartyId();
      $stmt = $this->conn->prepare("SELECT * FROM parties WHERE party_id = ? COLLATE latin1_bin LIMIT 1");
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

      $stmt->close();

      $stmt = $this->conn->prepare("SELECT refresh_token FROM users WHERE host_id = ? COLLATE latin1_bin LIMIT 1");
      $stmt->bind_param("s", $validation['host_id']);
      $stmt->execute();

      $result = $stmt->get_result();

      if ($result->num_rows === 0) {
         http_response_code(404);
         echo json_encode(['error' => 'User not found']);
         exit();
      }

      $row = $result->fetch_assoc();
      $refreshToken = $row['refresh_token'];
      $stmt->close();

      $curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, "https://accounts.spotify.com/api/token");
      curl_setopt($curl, CURLOPT_POST, true);
      curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query(['grant_type' => 'refresh_token', 'refresh_token' => $refreshToken, 'client_id' => $this->spotifyClientId]));
      curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded', 'Authorization: Basic ' . base64_encode("{$this->spotifyClientId}:{$this->spotifyClientSecret}")]);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($curl);
      $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

      if (curl_errno($curl)) {
         http_response_code(500);
         echo json_encode(['error' => curl_error($curl)]);
         exit();
      }

      curl_close($curl);

      if ($responseCode === 403) {
         http_response_code(403);
         echo json_encode(['error' => 'Invalid refresh token']);
         exit();
      }

      $result = json_decode($response, true);

      $accessToken = $result['access_token'];

      $tokenExpiresAt = gmdate('Y-m-d H:i:00',  time() + 3600);

      $partyExpiresAt = time() + $this->input['party_ends_in'] * 3600;
      $partyExpiresAt = (int) (round($partyExpiresAt / 60) * 60);
      $partyExpiresAt = gmdate('Y-m-d H:i:00', $partyExpiresAt);

      $stmt = $this->conn->prepare("INSERT INTO parties (party_id, host_id, access_token, party_expires_at, token_expires_at, explicit, duplicate_blocker) VALUES (?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("sssssii", $partyId, $validation['host_id'], $accessToken, $partyExpiresAt, $tokenExpiresAt, $this->input['explicit'], $this->input['duplicate_blocker']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Delete a party
    * @return never
    */
   private function deleteParty()
   {
      if (!cookieExists('session_id')) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $validation = validateSession($this->conn, cookieGet('session_id'), true);
      if (!$validation['validated']) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid session ID']);
         exit();
      }

      $stmt = $this->conn->prepare("DELETE FROM parties WHERE host_id = ? COLLATE latin1_bin");
      $stmt->bind_param("s", $validation['host_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No active party']);
         exit();
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Update the explicit setting for a party
    * @return never
    */
   private function updatePartyExplicit()
   {

      if (!cookieExists('session_id') || !isset($this->input['explicit'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $validation = validateSession($this->conn, cookieGet('session_id'), true);
      if (!$validation['validated']) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid session ID']);
         exit();
      }

      $stmt = $this->conn->prepare("UPDATE parties SET explicit = ? WHERE host_id = ? COLLATE latin1_bin");
      $stmt->bind_param("is", $this->input['explicit'], $validation['host_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No active party']);
         exit();
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Update the duplicate blocker setting for a party
    * @return never
    */
   private function updatePartyDuplicateBlocker()
   {
      if (!cookieExists('session_id') || !isset($this->input['duplicate_blocker'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $validation = validateSession($this->conn, cookieGet('session_id'), true);
      if (!$validation['validated']) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid session ID']);
         exit();
      }

      $stmt = $this->conn->prepare("UPDATE parties SET duplicate_blocker = ? WHERE host_id = ? COLLATE latin1_bin");
      $stmt->bind_param("is", $this->input['duplicate_blocker'], $validation['host_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No active party']);
         exit();
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Extend the duration of a party
    * @return never
    */
   private function extendPartyDuration()
   {
      if (!cookieExists('session_id') || !isset($this->input['extend_by'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $validation = validateSession($this->conn, cookieGet('session_id'), true);
      if (!$validation['validated']) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid session ID']);
         exit();
      }

      $stmt = $this->conn->prepare("UPDATE parties SET party_expires_at = DATE_ADD(party_expires_at, INTERVAL ? HOUR) WHERE host_id = ? COLLATE latin1_bin");
      $stmt->bind_param("is", $this->input['extend_by'], $validation['host_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   private function updatePauseStatus()
   {
      if (!cookieExists('session_id') || !isset($this->input['paused'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $validation = validateSession($this->conn, cookieGet('session_id'), true);
      if (!$validation['validated']) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid session ID']);
         exit();
      }

      $stmt = $this->conn->prepare("UPDATE parties SET paused = ? WHERE host_id = ? COLLATE latin1_bin");
      $stmt->bind_param("is", $this->input['paused'], $validation['host_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      if ($stmt->affected_rows === 0) {
         http_response_code(400);
         echo json_encode(['error' => 'No active party']);
         exit();
      }

      $stmt->close();

      http_response_code(200);
      echo json_encode(['success' => true]);
      exit();
   }

   /**
    * Generates a new party id for the party replacing the old one
    * @return void
    */
   private function generateNewPartyId()
   {
      if (!cookieExists('session_id')) {
         http_response_code(400);
         echo json_encode(['error' => 'Missing parameters']);
         exit();
      }

      $validation = validateSession($this->conn, cookieGet('session_id'), true);
      if (!$validation['validated']) {
         http_response_code(400);
         echo json_encode(['error' => 'Invalid session ID']);
         exit();
      }

      $stmt = $this->conn->prepare("SELECT party_id FROM parties WHERE host_id = ? COLLATE latin1_bin");
      $stmt->bind_param("s", $validation['host_id']);
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

      $stmt->close();

      $partyId = $this->generatePartyId();
      $stmt = $this->conn->prepare("SELECT * FROM parties WHERE party_id = ? COLLATE latin1_bin LIMIT 1");
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

      $stmt->close();

      $stmt = $this->conn->prepare("UPDATE parties SET party_id = ? WHERE host_id = ? COLLATE latin1_bin");
      $stmt->bind_param("ss", $partyId, $validation['host_id']);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         echo json_encode(['error' => $stmt->error]);
         exit();
      }

      $stmt->close();
      http_response_code(200);
      echo json_encode(['success' => true]);
   }
}

$api = new DatabaseHandler($conn, $allowedDomain, $spotifyClientId, $spotifyClientSecret);
$api->handleRequest();
$conn->close();
