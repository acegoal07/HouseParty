<?php
include '../secrets.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: POST, GET");

class SpotifyHandler
{
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  REFERENCES  ////////////////////////////////////////////////////////////////////////////////////////////
   private $conn;
   private $allowedDomain;
   private $input = [];

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  FUNCTIONS  /////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructor
    * @param mysqli $conn The database connection
    */
   public function __construct($conn, $allowedDomain)
   {
      $this->conn = $conn;
      $this->allowedDomain = $allowedDomain;
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
         case 'getCurrentlyPlaying':
            $this->getCurrentlyPlaying();
            break;
         case 'searchSongByName':
            $this->searchSongByName();
            break;
         // Handle POST requests
         case 'addSongToQueue':
            $this->addSongToQueue();
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
    * Get the authorisation token for a party from the database
    * @param string $partyId The party ID
    * @return array|null The authorisation token, explicit content setting, and duplicate blocker setting
    */
   private function getPartyInfo($partyId)
   {
      $stmt = $this->conn->prepare("SELECT access_token, explicit, duplicate_blocker FROM parties WHERE party_id = ? COLLATE latin1_bin");
      $stmt->bind_param("s", $partyId);
      $stmt->execute();

      if ($stmt->error) {
         http_response_code(500);
         exit();
      }

      $result = $stmt->get_result();

      if ($result->num_rows === 0) {
         http_response_code(400);
         exit();
      }

      $row = $result->fetch_assoc();

      $stmt->close();
      return ['auth' => "Authorization: Bearer " . $row['access_token'], 'explicit' => $row['explicit'], 'duplicate_blocker' => $row['duplicate_blocker']];
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  GET REQUESTS  //////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Get the currently playing song
    * @return never
    */
   private function getCurrentlyPlaying()
   {
      if (!isset($this->input['party_id'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Missing parameters']);
         exit();
      }

      $party_info = $this->getPartyInfo($this->input['party_id']);
      if ($party_info == null) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Invalid party_id']);
         exit();
      }

      $curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/currently-playing");
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
      $response = curl_exec($curl);
      curl_close($curl);

      echo $response;
      exit();
   }

   /**
    * Search for a song by name
    * @return never
    */
   private function searchSongByName()
   {
      if (!isset($this->input['party_id']) || !isset($this->input['search_term'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Missing parameters']);
         exit();
      }

      $party_info = $this->getPartyInfo($this->input['party_id']);
      if ($party_info == null) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Invalid partyId']);
         exit();
      }

      $curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/search?q=" . urlencode($this->input['search_term']) . "&type=track&limit=50");
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
      $response = curl_exec($curl);
      $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
      curl_close($curl);

      if ($responseCode === 429) {
         http_response_code(200);
         echo json_encode(['tracks' => [], 'response_code' => 1]);
         exit();
      }

      $tracks = json_decode($response, true)['tracks']['items'] ?? [];

      if ($party_info['explicit'] == 0) {
         $tracks = array_filter($tracks, fn($item) => !$item['explicit']);
      }

      $slicedTracks = array_slice($tracks, 0, 20);

      http_response_code(200);
      echo json_encode(['tracks' => $slicedTracks, 'response_code' => 0]);
      exit();
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //  POST REQUESTS  /////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Add a song to the queue
    * @return never
    */
   private function addSongToQueue()
   {
      if (!isset($this->input['party_id']) || !isset($this->input['song_id'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Missing parameters']);
         exit();
      }

      $party_info = $this->getPartyInfo($this->input['party_id']);
      if ($party_info == null) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Invalid partyId']);
         exit();
      }

      // Check if the player is currently playing so songs can be added
      $curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player");
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
      $response = curl_exec($curl);
      $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
      curl_close($curl);

      if (!$response || $responseCode === 204) {
         http_response_code(200);
         echo json_encode(['success' => false, 'response_code' => 0]);
         exit();
      }

      if ($responseCode === 429) {
         http_response_code(200);
         echo json_encode(['success' => false, 'response_code' => 4]);
         exit();
      }

      $responseData = json_decode($response, true);

      if ($responseData === null || ($responseData['is_playing'] ?? false) === false) {
         http_response_code(200);
         echo json_encode(['success' => false, 'response_code' => 3]);
         exit();
      }

      // if explicit content is blocked, check if the song is explicit before adding it
      if ($party_info['explicit'] != 1) {
         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/tracks/" . explode(":", $this->input['song_id'])[2]);
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
         $response = curl_exec($curl);
         $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
         $responseData = json_decode($response, true);
         curl_close($curl);

         if (!$response) {
            http_response_code(200);
            echo json_encode(['success' => false, 'response_code' => 0]);
            exit();
         }

         if ($responseCode === 429) {
            http_response_code(200);
            echo json_encode(['success' => false, 'response_code' => 4]);
            exit();
         }

         if ($responseData['explicit'] == 1) {
            http_response_code(200);
            echo json_encode(['success' => false, 'response_code' => 5]);
            exit();
         }
      }

      // if duplicate blocking is enabled, check the queue for duplicates
      if ($party_info['duplicate_blocker'] == 1) {
         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue");
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
         $response = curl_exec($curl);
         $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
         $responseData = json_decode($response, true);
         curl_close($curl);

         if (!$response) {
            http_response_code(200);
            echo json_encode(['success' => false, 'response_code' => 0]);
            exit();
         }

         if ($responseCode === 429) {
            http_response_code(200);
            echo json_encode(['success' => false, 'response_code' => 4]);
            exit();
         }

         if (count($responseData['queue'] ?? []) > 0) {
            $duplicate = false;
            foreach ($responseData['queue'] as $item) {
               if ($item['uri'] === $this->input['song_id']) {
                  $duplicate = true;
                  break;
               }
            }

            if ($duplicate) {
               http_response_code(200);
               echo json_encode(['success' => false, 'response_code' => 2]);
               exit();
            }
         }
      }

      // Add the song to the queue if all checks pass
      $curl = curl_init();
      curl_setopt($curl, CURLOPT_POST, true);
      curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue?uri=" . urlencode($this->input['song_id']));
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [
         $party_info['auth'],
         'Content-Length: 0'
      ]);

      if (curl_exec($curl)) {
         $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

         if ($responseCode === 429) {
            http_response_code(200);
            echo json_encode(['success' => false, 'response_code' => 4]);
            exit();
         }

         if ($responseCode !== 200) {
            http_response_code(200);
            echo json_encode(['success' => false, 'response_code' => 0]);
            exit();
         }
      } else {
         http_response_code(200);
         echo json_encode(['success' => false, 'response_code' => 0]);
         exit();
      }

      curl_close($curl);

      http_response_code(200);
      echo json_encode(['success' => true, 'response_code' => 1]);
      exit();
   }
}

$api = new SpotifyHandler($conn, $allowedDomain);
$api->handleRequest();
$conn->close();
