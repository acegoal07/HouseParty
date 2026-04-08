<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/cookieHandler.php';

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
 * Validates that the session id is valid
 * @param mysqli $conn The MySQLi connection
 * @param string $session_id The session ID to validate
 * @param bool $host_id Whether to return the host_id associated with the session
 * @return array{validated:bool, host_id:string|null} Tuple [validated, host_id] or false if invalid
 */
function validateSession($conn, $session_id, $host_id = false)
{
   global $cookieLifespan;

   if (!is_string($session_id) || strlen($session_id) !== 64 || !ctype_xdigit($session_id)) {
      cookieDelete('session_id');
      return ['validated' => false, 'host_id' => null];
   }

   $stmt = $conn->prepare("SELECT host_id, expires_at FROM sessions WHERE session_id = ? COLLATE latin1_bin LIMIT 1");
   $stmt->bind_param("s", $session_id);
   $stmt->execute();
   $results = $stmt->get_result();
   $stmt->close();

   $row = $results->fetch_assoc();

   if (strtotime($row['expires_at']) < time() + 3600) {
      $expires_timestamp = time() + $cookieLifespan;
      $expires_at = date('Y-m-d H:i:s', $expires_timestamp);
      $stmt = $conn->prepare("UPDATE sessions SET expires_at = ? WHERE session_id = ? COLLATE latin1_bin");
      $stmt->bind_param("ss", $expires_at, $session_id);
      $stmt->execute();
      $stmt->close();
      cookieSet('session_id', $session_id, $expires_at);
   }

   if ($results->num_rows === 0) {
      cookieDelete('session_id');
      return ['validated' => false, 'host_id' => null];
   } else {
      return ['validated' => true, 'host_id' => $host_id ? $row['host_id'] : null];
   }
}

/**
 * Validates the session and retrieves associated party information
 * @param mysqli $conn The MySQLi connection
 * @param string $session_id The session ID to validate
 * @return array{validated:bool, active_party:bool, party:array|null} Tuple [validated, extended, active_party, parties]
 */
function validateSessionGetInfo($conn, $session_id)
{
   $validation = validateSession($conn, $session_id, true);
   if (!$validation['validated']) {
      cookieDelete('session_id');
      return $validation;
   }

   // Check for any party associated with this host by session — only fetch one row
   $stmt = $conn->prepare("SELECT p.party_id, p.party_expires_at, p.explicit, p.duplicate_blocker FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE s.session_id = ? COLLATE latin1_bin LIMIT 1");
   $stmt->bind_param("s", $session_id);
   $stmt->execute();
   $results = $stmt->get_result();
   $row = $results->fetch_assoc();
   $stmt->close();

   $hasParty = $row !== null && $row !== false;
   return ['validated' => true, 'host_id' => $validation['host_id'], 'active_party' => $hasParty, 'party' => $hasParty ? $row : null];
}

/**
 * Validates the session and checks for an active party
 * @param mysqli $conn The MySQLi connection
 * @param string $session_id The session ID to validate
 * @return array{validated:bool, active_party:bool} Tuple [validated, active_party]
 */
function validateSessionGetPartialInfo($conn, $session_id)
{
   $validation = validateSession($conn, $session_id, true);
   if (!$validation['validated']) {
      cookieDelete('session_id');
      return $validation;
   }

   // Check for any party associated with this host by session — only fetch one row
   $stmt = $conn->prepare("SELECT p.party_id FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE s.session_id = ? COLLATE latin1_bin LIMIT 1");
   $stmt->bind_param("s", $session_id);
   $stmt->execute();
   $results = $stmt->get_result();
   $row = $results->fetch_assoc();
   $stmt->close();

   $hasParty = $row !== null && $row !== false;
   return ['validated' => true, 'active_party' => $hasParty];
}
