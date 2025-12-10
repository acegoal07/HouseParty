<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/checkOrigin.php';
include __DIR__ . '/../util/parseInput.php';
include __DIR__ . '/../util/getPartyInfo.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// If browser sends an option return info
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

// Check if the request method is valid
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

class SearchForSong
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
      // Get party id and check if it's not empty
      $partyId = $this->input['party_id'] ?? [];

      if (empty($partyId)) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'badRequest',
               'message' => 'party_id is required'
            ]
         ]);
         exit();
      }

      // Get query and check if it's not empty
      $searchQuery = $this->input['query'] ?? [];

      if (empty($searchQuery)) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'badRequest',
               'message' => 'query is required'
            ]
         ]);
         exit();
      }

      // Retrieve the information about the party the id was provided for and checks if it's active
      $partyInfo = getPartyInfo($this->conn, $partyId);

      if (!$partyInfo) {
         http_response_code(404);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'noActiveParty',
               'message' => 'Party not found'
            ]
         ]);
         exit();
      }

      // Send a request with the query to the spotify servers to perform a search for a song
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/search?q=" . urlencode($searchQuery) . "&type=track&limit=50");
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, [$partyInfo['access_token']]);
      $response = curl_exec($ch);

      if (curl_errno($ch)) {
         http_response_code(500);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'request',
               'message' => curl_error($ch)
            ]
         ]);
         exit();
      }

      $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

      if ($responseCode === 429) {
         http_response_code(429);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'rateLimitReached',
               'message' => 'The spotify rate limit has been reached try again later'
            ]
         ]);
         exit();
      }

      $responseData = json_decode($response, true)['tracks']['items'] ?? [];

      // If explicit isn't allowed in the party filter out any explicit songs
      if (!$partyInfo['explicit']) {
         $responseData = array_filter($responseData, fn($item) => !$item['explicit']);
      }

      // Shrink the search results down to a max of 20 items
      $responseData = array_slice($responseData, 0, 20);

      http_response_code(200);
      echo json_encode([
         'success' => true,
         'tracks' => $responseData
      ]);
      exit();
   }
}

new SearchForSong();
