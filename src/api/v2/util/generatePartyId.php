<?php
// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Generate a random party ID
 * @return string The generated party ID
 */
function generatePartyId($conn)
{
   function generate()
   {
      $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      $randomString = '';
      for ($i = 0; $i < 6; $i++) {
         $randomString .= $characters[random_int(0, strlen($characters) - 1)];
      }
      return $randomString;
   }
   $count = 0;
   $partyId = '';

   do {
      $partyId = generate();
      $stmt = $conn->prepare("SELECT COUNT(*) FROM parties WHERE party_id = ? COLLATE latin1_bin");
      $stmt->bind_param('s', $partyId);
      $stmt->execute();
      $stmt->bind_result($count);
      $stmt->fetch();
      $stmt->close();
   } while ($count > 0);

   return $partyId;
}
