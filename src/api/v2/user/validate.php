<?php
include __DIR__ . '/../secrets.php';
include __DIR__ . '/../util/sessionHandler.php';
include __DIR__ . '/../util/checkOrigin.php';
include __DIR__ . '/../util/parseInput.php';
header("Access-Control-Allow-Origin: {$allowedDomain}");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
   http_response_code(204);
   exit();
}

checkOrigin();

$input = parseInput($conn);
if ($input === null) {
   exit();
}

$sessionToken = $_COOKIE['session_id'] ?? '';

if (empty($sessionToken)) {
   http_response_code(401);
   echo json_encode(['error' => 'Unauthorized: No session token provided']);
   exit();
}

while (true) {
   $results = validateSession($conn, $sessionToken);

   if (!$results['validated']) {
      // Session is valid; continue processing
      echo "event: {invalidSessionId}\n";
      ob_flush();
      flush();
      break;
   }

   ob_flush();
   flush();
   sleep(2);
}
