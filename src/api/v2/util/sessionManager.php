<?php
require_once __DIR__ . '/../secrets.php';
require_once __DIR__ . '/cookieManager.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Creates a new session for the given host ID and refresh token
 * @param mysqli $conn The MySQLi connection
 * @param string $host_id The hashed host ID
 * @param string $refresh_token The Spotify refresh token
 * @return array{session_id:string, expires_at:string} Tuple [session_id, expires_at (Y-m-d H:i:s)]
 * @throws mysqli_sql_exception On database errors
 */
function createSession($conn, $host_id, $refresh_token)
{
   global $cookieLifespan;

   // Insert or update the user record
   $stmt = $conn->prepare(
      "INSERT INTO users (host_id, refresh_token) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE refresh_token = VALUES(refresh_token)"
   );
   $stmt->bind_param("ss", $host_id, $refresh_token);
   $stmt->execute();
   $stmt->close();

   // Generate a new session ID and expiration time
   $session_id = bin2hex(random_bytes(32));
   $expires_timestamp = time() + $cookieLifespan;
   $expires_at = date('Y-m-d H:i:s', $expires_timestamp);

   // Insert the new session
   $stmt = $conn->prepare(
      "INSERT INTO sessions (session_id, host_id, expires_at) VALUES (?, ?, ?)"
   );
   $stmt->bind_param("sss", $session_id, $host_id, $expires_at);
   $stmt->execute();
   $stmt->close();

   cookieSet('session_id', $session_id, $expires_timestamp);

   $conn->close();

   return [$session_id, $expires_at];
}

/**
 * Deletes the session with the given session ID
 * @param mysqli $conn The MySQLi connection
 * @param mixed $session_id The session ID to delete
 * @return void
 */
function deleteSession($conn, $session_id)
{
   $stmt = $conn->prepare("DELETE FROM sessions WHERE session_id = ? COLLATE latin1_bin");
   $stmt->bind_param("s", $session_id);
   $stmt->execute();
   $stmt->close();
}

/**
 * Validates the user's session ID and optionally returns party information.
 * @param mysqli $conn The MySQLi database connection.
 * @param string $session_id The session ID to validate.
 * @param "none"|"minimal"|"full" $party_info_level The level of party info to return.
 * @return array{
 *   validated: bool,
 *   active_party?: bool,
 *   party?: mixed
 * }
 */
function validateSession($conn, $session_id, $party_info_level = "none")
{
   if (!is_string($session_id) || strlen($session_id) !== 64 || !ctype_xdigit($session_id)) {
      cookieDelete('session_id');
      return [
         'validated' => false
      ];
   }

   $stmt = $conn->prepare("SELECT expires_at FROM sessions WHERE session_id = ? COLLATE latin1_bin LIMIT 1");
   $stmt->bind_param("s", $session_id);
   $stmt->execute();
   $expires_at = "";
   $stmt->bind_result($expires_at);
   $stmt->fetch();
   $stmt->close();

   if (empty($expires_at)) {
      cookieDelete('session_id');
      return [
         'validated' => false
      ];
   }

   if (strtotime($expires_at) < time() + 3600) {
      $expires_timestamp = time() + $GLOBALS['cookieLifespan'];
      $expires_at = date('Y-m-d H:i:s', $expires_timestamp);
      $stmt = $conn->prepare("UPDATE sessions SET expires_at = ? WHERE session_id = ? COLLATE latin1_bin");
      $stmt->bind_param("ss", $expires_at, $session_id);
      $stmt->execute();
      $stmt->close();
      cookieSet('session_id', $session_id, $expires_at);
   }

   if ($party_info_level === "full") {
      $stmt = $conn->prepare("SELECT p.party_id, p.party_expires_at, p.explicit, p.duplicate_blocker FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE s.session_id = ? COLLATE latin1_bin LIMIT 1");
      $stmt->bind_param("s", $session_id);
      $stmt->execute();
      $party_info = $stmt->get_result();
      $party_info_row = $party_info->fetch_assoc();
      $stmt->close();

      if ($party_info->num_rows === 0) {
         return [
            'validated' => true,
            'active_party' => false
         ];
      } else {
         return [
            'validated' => true,
            'active_party' => true,
            'party' => $party_info_row
         ];
      }
   } elseif ($party_info_level === "minimal") {
      $stmt = $conn->prepare("SELECT count(*) FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE s.session_id = ? COLLATE latin1_bin LIMIT 1");
      $stmt->bind_param("s", $session_id);
      $stmt->execute();
      $count = 0;
      $stmt->bind_result($count);
      $stmt->fetch();
      $stmt->close();

      return [
         'validated' => true,
         'active_party' => $count === 1 ? true : false
      ];
   } else {
      return [
         'validated' => true
      ];
   }
}
