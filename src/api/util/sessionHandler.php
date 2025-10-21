<?php
include __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

class SessionHelper
{
   private $conn;
   private $sessionDuration = 43200;

   /**
    * Constructor
    * @param mysqli $conn The database connection
    */
   public function __construct($conn)
   {
      $this->conn = $conn;
   }

   /**
    * Destructor
    */
   public function __destruct()
   {
      $this->conn->close();
   }

   /**
    * Creates a new session for the given host ID and refresh token
    * @param string $host_id The hashed host ID
    * @param string $refresh_token The Spotify refresh token
    * @return array{session_id:string, expires_at:string} Tuple [session_id, expires_at (Y-m-d H:i:s)]
    * @throws mysqli_sql_exception On database errors
    */
   public function createSession($host_id, $refresh_token)
   {
      // Insert or update the user record
      $stmt = $this->conn->prepare(
         "INSERT INTO users (host_id, refresh_token) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE refresh_token = VALUES(refresh_token)"
      );
      $stmt->bind_param("ss", $host_id, $refresh_token);
      $stmt->execute();
      $stmt->close();

      // Generate a new session ID and expiration time
      $session_id = bin2hex(random_bytes(32));
      $expires_at = date('Y-m-d H:i:s', time() + $this->sessionDuration);

      // Insert the new session
      $stmt = $this->conn->prepare(
         "INSERT INTO sessions (session_id, host_id, expires_at) VALUES (?, ?, ?)"
      );
      $stmt->bind_param("sss", $session_id, $host_id, $expires_at);
      $stmt->execute();
      $stmt->close();

      return [$session_id, $expires_at];
   }

   /**
    * Deletes the session with the given session ID
    * @param mixed $session_id
    * @return void
    */
   public function deleteSession($session_id)
   {
      $stmt = $this->conn->prepare("DELETE FROM sessions WHERE session_id = ? COLLATE latin1_bin");
      $stmt->bind_param("s", $session_id);
      $stmt->execute();
      $stmt->close();
   }

   /**
    * Validates that the session id is valid
    * @param string $session_id The session ID to validate
    * @param bool $host_id Whether to return the host_id associated with the session
    * @return array{validated:bool, extended:bool, host_id:string|null} Tuple [validated, extended, host_id] or false if invalid
    */
   public function validateSession($session_id, $host_id = false)
   {
      if (!is_string($session_id) || strlen($session_id) !== 64 || !ctype_xdigit($session_id)) {
         return ['validated' => false, 'extended' => false, 'host_id' => null];
      }

      $stmt = $this->conn->prepare("SELECT host_id, expires_at FROM sessions WHERE session_id = ? COLLATE latin1_bin LIMIT 1");
      $stmt->bind_param("s", $session_id);
      $stmt->execute();
      $results = $stmt->get_result();
      $stmt->close();

      $row = $results->fetch_assoc();
      $extended = false;

      if (strtotime($row['expires_at']) < time() + 3600) {
         $new_expires_at = date('Y-m-d H:i:s', time() + $this->sessionDuration);
         $stmt = $this->conn->prepare("UPDATE sessions SET expires_at = ? WHERE session_id = ? COLLATE latin1_bin");
         $stmt->bind_param("ss", $new_expires_at, $session_id);
         $stmt->execute();
         $stmt->close();
         $extended = true;
      }

      return ['validated' => $results->num_rows === 1, 'extended' => $extended, 'host_id' => $host_id ? $row['host_id'] : null];
   }

   /**
    * Validates the session and retrieves associated party information
    * @param string $session_id The session ID to validate
    * @return array{validated:bool, extended:bool, active_party:bool, parties:array} Tuple [validated, extended, active_party, parties]
    */
   public function validateSessionGetInfo($session_id)
   {
      $validation = $this->validateSession($session_id, true);
      if (!$validation['validated']) {
         return $validation;
      }

      // get any parties that are available with the same host_id
      $stmt = $this->conn->prepare("SELECT p.party_id, p.party_expires_at, p.explicit, p.duplicate_blocker FROM parties p JOIN sessions s ON p.host_id = s.host_id WHERE s.session_id = ? COLLATE latin1_bin");
      $stmt->bind_param("s", $session_id);
      $stmt->execute();
      $results = $stmt->get_result();
      $parties = [];
      while ($row = $results->fetch_assoc()) {
         $parties[] = $row;
      }
      $stmt->close();
      return ['validated' => true, 'extended' => $validation['extended'], 'host_id' => $validation['host_id'], 'active_party' => $parties[0] !== null, 'parties' => $parties];
   }

   /**
    * Performs cleanup of expired sessions and orphaned users
    * @return void
    */
   public function cleanup()
   {
      // Delete expired sessions
      $this->conn->query("DELETE FROM sessions WHERE expires_at <= NOW()");

      // Delete users without active sessions or parties
      $sql = "DELETE u FROM users u
              LEFT JOIN sessions s ON u.host_id = s.host_id
              LEFT JOIN parties p ON u.host_id = p.host_id
              WHERE s.session_id IS NULL AND p.party_id IS NULL";
      $this->conn->query($sql);
   }
}
