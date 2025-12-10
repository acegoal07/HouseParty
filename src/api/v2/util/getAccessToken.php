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
      throw new Exception('Error fetching access token: ' . curl_error($ch));
   }

   $response = json_decode($result, true);
   if (isset($response['access_token'])) {
      return $response['access_token'];
   } else {
      throw new Exception('Error fetching access token: ' . ($response['error_description'] ?? 'Unknown error'));
   }
}
