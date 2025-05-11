<?php
include '../secrets.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: POST, GET");

class SpotifyHandler
{
   private $conn;
   private $allowedDomain;

   /**
    * Constructor
    * @param mysqli $conn The database connection
    */
   public function __construct($conn, $allowedDomain)
   {
      $this->conn = $conn;
      $this->allowedDomain = $allowedDomain;
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
      if (strpos($_SERVER['HTTP_REFERER'] ?? '', $this->allowedDomain) !== 0 && strpos($_SERVER['HTTP_ORIGIN'] ?? '', $this->allowedDomain) !== 0) {
         http_response_code(403);
         echo json_encode(['error' => 'Forbidden']);
         exit();
      }
   }

   /**
    * Get the authorisation token for a party from the database
    * @param string $partyId The party ID
    * @return array|null The authorisation token, explicit content setting, and duplicate blocker setting
    */
   private function getPartyInfo($partyId)
   {
      $stmt = $this->conn->prepare("SELECT access_token, explicit, duplicate_blocker FROM parties WHERE party_id = ? COLLATE utf8_bin");
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
      return ['auth' => "Authorization: Bearer " . $row['access_token'], 'explicit' => $row['explicit'], 'duplicateBlocker' => $row['duplicate_blocker']];
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
      switch ($_SERVER['REQUEST_METHOD']) {
         case 'GET':
            if (!isset($_GET['type'])) {
               http_response_code(400);
               echo json_encode(['error' => 'Bad Request: Missing type parameter']);
               exit();
            }
            $this->handleGetRequest();
            break;
         case 'POST':
            if (!isset($_POST['type'])) {
               http_response_code(400);
               echo json_encode(['error' => 'Bad Request: Missing type parameter']);
               exit();
            }
            $this->handlePostRequest();
            break;
         default:
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
         case 'getCurrentlyPlaying':
            $this->getCurrentlyPlaying();
            break;
         case 'searchSongByName':
            $this->searchSongByName();
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
         case 'addSongToQueue':
            $this->addSongToQueue();
            break;
         default:
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Invalid POST type']);
            exit();
      }
   }

   /**
    * Get the currently playing song
    * @return never
    */
   private function getCurrentlyPlaying()
   {
      if (!isset($_GET['partyId'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Missing partyId']);
         exit();
      }

      $_GET['partyId'] = $this->conn->real_escape_string($_GET['partyId']);

      $party_info = $this->getPartyInfo($_GET['partyId']);
      if ($party_info == null) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Invalid partyId']);
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
      if (!isset($_GET['partyId']) || !isset($_GET['searchTerm'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Missing parameters']);
         exit();
      }

      $_GET['partyId'] = $this->conn->real_escape_string($_GET['partyId']);
      $_GET['searchTerm'] = $this->conn->real_escape_string($_GET['searchTerm']);

      $party_info = $this->getPartyInfo($_GET['partyId']);
      if ($party_info == null) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Invalid partyId']);
         exit();
      }

      $searchTerm = urlencode($_GET['searchTerm']);

      $curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/search?q={$searchTerm}&type=track&limit=50");
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
      $response = curl_exec($curl);
      $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
      curl_close($curl);

      if ($responseCode === 429) {
         http_response_code(200);
         echo json_encode(['totalTracks' => 0, 'tracks' => [], 'code' => 1]);
         exit();
      }

      $responseData = json_decode($response, true);

      if (count($responseData['tracks']['items']) === 0) {
         http_response_code(200);
         echo json_encode(['totalTracks' => 0, 'tracks' => [], 'code' => 0]);
         exit();
      }

      if ($party_info['explicit'] == 0) {
         $responseData['tracks']['items'] = array_filter($responseData['tracks']['items'], function ($item) {
            return !$item['explicit'];
         });
      }

      http_response_code(200);
      echo json_encode(['totalTracks' => count($responseData['tracks']['items']), 'tracks' => $responseData['tracks']['items'], 'code' => 0]);
      exit();
   }

   /**
    * Add a song to the queue
    * @return never
    */
   private function addSongToQueue()
   {
      if (!isset($_POST['partyId']) || !isset($_POST['songId'])) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Missing parameters']);
         exit();
      }

      $_POST['partyId'] = $this->conn->real_escape_string($_POST['partyId']);
      $_POST['songId'] = $this->conn->real_escape_string($_POST['songId']);

      $party_info = $this->getPartyInfo($_POST['partyId']);
      if ($party_info == null) {
         http_response_code(400);
         echo json_encode(['error' => 'Bad Request: Invalid partyId']);
         exit();
      }

      $curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player");
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
      $response = curl_exec($curl);
      $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
      curl_close($curl);

      if ($responseCode === 429) {
         http_response_code(200);
         echo json_encode(['success' => true, 'responseCode' => 4]);
         exit();
      }

      if ($response === false) {
         http_response_code(200);
         echo json_encode(['success' => true, 'responseCode' => 0]);
         exit();
      }

      $responseData = json_decode($response, true);

      if ($responseData === null || $responseData['is_playing'] === false) {
         http_response_code(200);
         echo json_encode(['success' => true, 'responseCode' => 3]);
         exit();
      }

      if ($party_info['explicit'] != 1) {
         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/tracks/" . explode(":", $_POST['songId'])[2]);
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
         $response = curl_exec($curl);
         $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
         curl_close($curl);

         if ($responseCode === 429) {
            http_response_code(200);
            echo json_encode(['success' => true, 'responseCode' => 4]);
            exit();
         }

         if ($response === false) {
            http_response_code(200);
            echo json_encode(['success' => true, 'responseCode' => 0]);
            exit();
         }

         $responseData = json_decode($response, true);
         if ($responseData['explicit'] == 1) {
            http_response_code(200);
            echo json_encode(['success' => true, 'responseCode' => 5]);
            exit();
         }
      }

      if ($party_info['duplicateBlocker'] == 1) {
         $curl = curl_init();
         curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue");
         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
         $response = curl_exec($curl);
         $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
         curl_close($curl);

         if ($responseCode === 429) {
            http_response_code(200);
            echo json_encode(['success' => true, 'responseCode' => 4]);
            exit();
         }

         if ($response === false) {
            http_response_code(200);
            echo json_encode(['success' => true, 'responseCode' => 0]);
            exit();
         }

         $responseData = json_decode($response, true);

         if (count($responseData['queue']) > 0) {
            $duplicate = false;
            foreach ($responseData['queue'] as $item) {
               if ($item['uri'] === $_POST['songId']) {
                  $duplicate = true;
                  break;
               }
            }

            if ($duplicate) {
               http_response_code(200);
               echo json_encode(['success' => true, 'responseCode' => 2]);
               exit();
            }
         }
      }

      $curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue?uri=" . $_POST['songId']);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_HTTPHEADER, [$party_info['auth']]);
      curl_setopt($curl, CURLOPT_POST, true);
      curl_exec($curl);
      $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
      curl_close($curl);

      if ($responseCode === 429) {
         http_response_code(200);
         echo json_encode(['success' => true, 'responseCode' => 4]);
         exit();
      } elseif ($responseCode !== 200) {
         http_response_code(200);
         echo json_encode(['success' => true, 'responseCode' => 0]);
         exit();
      } else {
         http_response_code(200);
         echo json_encode(['success' => true, 'responseCode' => 1]);
         exit();
      }
   }
}

$api = new SpotifyHandler($conn, $allowedDomain);
$api->handleRequest();
