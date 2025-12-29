<?php
include_once __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Parse input based on request method and content type and return sanitized data.
 * @param mixed|null $conn Optional DB connection (e.g. mysqli) used for escaping.
 * @return mixed|null Sanitized input data, or null on error (e.g. invalid JSON).
 */
function parseInput($conn = null)
{
   $method = $_SERVER['REQUEST_METHOD'] ?? '';

   if ($method === 'GET') {
      $input = $_GET;
   } elseif ($method === 'POST') {
      $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

      if (strpos($contentType, 'application/json') !== false) {
         $rawInput = file_get_contents('php://input');
         $decoded = json_decode($rawInput, true);

         if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
            return null;
         }
         $input = $decoded;
      } else {
         $input = $_POST;
      }
   } else {
      // For other methods, attempt to read raw input; return empty array if none.
      $rawInput = file_get_contents('php://input');
      $input = $rawInput !== '' ? $rawInput : [];
   }

   return sanitizeInput($input, $conn);
}


/**
 * Sanitize input data
 * @param mixed $data The input data
 * @param mixed|null $conn Optional DB connection (e.g. mysqli) used for real_escape_string
 * @return mixed The sanitized data
 */
function sanitizeInput($data, $conn = null)
{
   if (is_array($data)) {
      $result = [];
      foreach ($data as $key => $value) {
         $result[$key] = sanitizeInput($value, $conn);
      }
      return $result;
   }

   if (is_string($data)) {
      return $GLOBALS['conn']->real_escape_string(trim($data));
   }

   return $data;
}
