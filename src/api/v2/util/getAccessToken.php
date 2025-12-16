<?php
include __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Get a new access token from Spotify using the provided refresh token
 * @param string $refreshToken
 * @return array{access_token: string|null, response_code: int|null, error: array{type: string, message: string}|null}
 * @throws Exception
 */
function getAccessToken($refreshToken)
{
   $ch = curl_init();

   curl_setopt($ch, CURLOPT_URL, 'https://accounts.spotify.com/api/token');
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
   curl_setopt($ch, CURLOPT_POST, 1);
   curl_setopt($ch, CURLOPT_HTTPHEADER, [
      'Content-Type: application/x-www-form-urlencoded'
   ]);
   curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
      'grant_type'    => 'refresh_token',
      'refresh_token' => $refreshToken,
      'client_id'     => $GLOBALS['spotifyClientId'],
      'client_secret' => $GLOBALS['spotifyClientSecret'],
   ]));

   $result = curl_exec($ch);
   if (curl_errno($ch)) {
      return [
         'response_code' => 500,
         'error' => [
            'type' => "unknown",
            'message' => "Error while retrieving some spotify information"
         ]
      ];
   }

   $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

   if ($responseCode === 429) {
      return [
         'response_code' => 429,
         'error' => [
            'type' => 'rateLimitReached',
            'message' => 'The spotify rate limit has been reached try again later'
         ]
      ];
   }

   $response = json_decode($result, true);
   if (isset($response['access_token'])) {
      return [
         'access_token' => $response['access_token']
      ];
   } else {
      return [
         'response_code' => 500,
         'error' => [
            'type' => "unknown",
            'message' => "Error while retrieving some spotify information"
         ]
      ];
   }
}
