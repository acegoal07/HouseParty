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

class SearchForSong
{
   private $conn;
   private $input;

   public function __construct()
   {
      checkOrigin();
      $this->conn = $GLOBALS['conn'];
      $this->input = parseInput();
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   public function handleRequest()
   {
      $partyId = $this->input['party_id'] ?? [];

      if (empty($partyId)) {
         http_response_code(400);
         echo json_encode(['success' => false, 'error' => 'Bad Request: party_id is required']);
         exit();
      }

      $searchQuery = $this->input['query'] ?? [];

      if (empty($searchQuery)) {
         http_response_code(400);
         echo json_encode(['success' => false, 'error' => 'Bad Request: query is required']);
         exit();
      }

      $partyInfo = getPartyInfo($this->conn, $partyId);

      if (!$partyInfo) {
         http_response_code(404);
         echo json_encode(['success' => false, 'error' => 'Party not found']);
         exit();
      }

      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/search?q=" . urlencode($searchQuery) . "&type=track&limit=50");
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, [$partyInfo['access_token']]);
      $response = curl_exec($ch);

      if (curl_errno($ch)) {
         http_response_code(500);
         echo json_encode(['success' => false, 'error' => 'Error searching for song: ' . curl_error($ch)]);
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

      if (!$partyInfo['explicit']) {
         $responseData = array_filter($responseData, fn($item) => !$item['explicit']);
      }

      $responseData = array_slice($responseData, 0, 20);

      http_response_code(200);
      echo json_encode(['success' => true, 'tracks' => $responseData]);
   }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
   http_response_code(405);
   echo json_encode(['success' => false, 'error' => 'Method not allowed']);
   exit();
}

$searchForSong = new SearchForSong();
$searchForSong->handleRequest();
