<?php
require_once __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Check the origin of the request against the allowed domain
 * @param "sse"|"standard" $endpointType
 * @return void
 */
function checkOrigin($endpointType = "standard")
{
   if (strpos($_SERVER['HTTP_REFERER'] ?? '', $GLOBALS['allowedDomain']) !== 0 && strpos($_SERVER['HTTP_ORIGIN'] ?? '', $GLOBALS['allowedDomain']) !== 0) {
      if ($endpointType === "sse") {
         http_response_code(403);
         echo "event: forbidden";
         echo "data: " . json_encode([
            'error' => [
               'type' => 'forbidden',
               'message' => 'Access to this resource is forbidden'
            ]
         ]) . "\n\n";
         exit();
      } else {
         http_response_code(403);
         echo json_encode([
            'error' => [
               'type' => 'forbidden',
               'message' => 'Access to this resource is forbidden'
            ]
         ]);
         exit();
      }
   }
}
