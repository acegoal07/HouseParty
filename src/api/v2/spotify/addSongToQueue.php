<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/checkOrigin.php';
include __DIR__ . '/../util/parseInput.php';
include __DIR__ . '/../util/getPartyInfo.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

class AddSongToQueue
{
   private $conn;
   private $input;

   public function __construct()
   {
      checkOrigin();
      $this->conn = $GLOBALS['conn'];
      $this->input = parseInput($this->conn);
   }

   public function __destruct()
   {
      $this->conn->close();
   }

   public function HandleRequest()
   {
      $partyId = $this->input['party_id'] ?? '';

      if (empty($partyId)) {
         http_response_code(400);
         echo json_encode(['success' => false, 'error' => 'Bad Request: party_id is required']);
         exit();
      }

      $trackUri = $this->input['track_uri'] ?? '';

      if (empty($trackUri)) {
         http_response_code(400);
         echo json_encode(['success' => false, 'error' => 'Bad Request: track_uri is required']);
         exit();
      }

      $partyInfo = getPartyInfo($this->conn, $partyId);

      if (!$partyInfo) {
         http_response_code(404);
         echo json_encode(['success' => false, 'error' => 'Party not found']);
         exit();
      }

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/me/player");
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, [$partyInfo['access_token']]);
      $response = curl_exec($ch);

      if (!$response || curl_errno($ch)) {
         http_response_code(500);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => "unknown",
               'message' => "Error while retrieving some spotify information"
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

      if (!$response || $responseCode === 204) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => "noActivePlayer",
               'message' => "There is no spotify player"
            ]
         ]);
         exit();
      }

      $responseData = json_decode($response, true);

      if (!$responseData || ($responseData['is_playing'] ?? false) === false) {
         http_response_code(400);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => 'noActivePlayer',
               'message' => "There is no music being played"
            ]
         ]);
         exit();
      }

      if (!$partyInfo['explicit']) {
         $ch = curl_init();
         curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/tracks/" . explode(":", $trackUri)[2]);
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($ch, CURLOPT_HTTPHEADER, [$partyInfo['access_token']]);
         $response = curl_exec($ch);

         if (!$response || curl_errno($ch)) {
            http_response_code(500);
            echo json_encode([
               'success' => false,
               'error' => [
                  'type' => "unknown",
                  'message' => "Error while retrieving some spotify information"
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

         $responseData = json_decode($response, true);

         if ($responseData['explicit']) {
            http_response_code(403);
            echo json_encode([
               'success' => false,
               'error' => [
                  'type' => 'explicitContentBlocked',
                  'message' => 'Explicit content is not allowed in this party'
               ]
            ]);
         }
      }

      if ($partyInfo['duplicate_blocker']) {
         $ch = curl_init();
         curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue");
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($ch, CURLOPT_HTTPHEADER, [$partyInfo['access_token']]);
         $response = curl_exec($ch);

         if (!$response || curl_errno($ch)) {
            http_response_code(500);
            echo json_encode([
               'success' => false,
               'error' => [
                  'type' => "unknown",
                  'message' => "Error while retrieving some spotify information"
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

         $responseData = json_decode($response, true);

         if (count($responseData['queue'] ?? []) > 0) {
            $duplicate = false;
            foreach ($responseData['queue'] as $item) {
               if ($item['uri'] === $trackUri) {
                  $duplicate = true;
                  break;
               }
            }

            if ($duplicate) {
               http_response_code(409);
               echo json_encode([
                  'success' => false,
                  'error' => [
                     'type' => 'duplicateSongBlocked',
                     'message' => 'A duplicate song has been detected in the queue'
                  ]
               ]);
               exit();
            }
         }
      }

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_URL, "https://api.spotify.com/v1/me/player/queue?uri=" . urlencode($trackUri));
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, [
         $partyInfo['access_token'],
         'Content-Length: 0'
      ]);
      $response = curl_exec($ch);

      if (!$response || curl_errno($ch)) {
         http_response_code(500);
         echo json_encode([
            'success' => false,
            'error' => [
               'type' => "unknown",
               'message' => "Error while retrieving some spotify information"
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

      http_response_code(200);
      echo json_encode([
         'success' => true
      ]);
      exit();
   }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
   http_response_code(405);
   echo json_encode(['success' => false, 'error' => 'Method not allowed']);
   exit();
}

$addSongToQueue = new AddSongToQueue();
$addSongToQueue->HandleRequest();
