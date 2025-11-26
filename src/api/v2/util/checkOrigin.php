<?php
include __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Check the origin of the request against the allowed domain
 * @return void
 */
function checkOrigin()
{
   if (strpos($_SERVER['HTTP_REFERER'] ?? '', $GLOBALS['allowedDomain']) !== 0 && strpos($_SERVER['HTTP_ORIGIN'] ?? '', $GLOBALS['allowedDomain']) !== 0) {
      http_response_code(403);
      echo json_encode(['error' => 'Forbidden']);
      exit();
   }
}
