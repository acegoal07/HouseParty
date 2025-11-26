<?php
include __DIR__ . '/../secrets.php';

// Only allow CLI or cron execution
if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
   http_response_code(403);
   exit();
}

/**
 * Set the cookie using the provided information
 * @param mixed $name The name of the cookie
 * @param mixed $value The value of the cookie
 * @param mixed $expiryTime The expiration time as a Unix timestamp
 * @return bool True on success, false on failure
 */
function cookieSet($name, $value, $expiryTime)
{
   return setcookie($name, $value, [
      'expires'  => $expiryTime,
      'path'     => '/',
      'domain'   => $GLOBALS['cookieDomain'],
      'secure'   => true,
      'httponly' => true,
      'samesite' => 'Strict',
   ]);
}

/**
 * Delete the cookie by setting its expiration time in the past
 * @param mixed $name The name of the cookie
 * @return bool True on success, false on failure
 */
function cookieDelete($name)
{
   return cookieSet($name, '', time() - 3600);
}

/**
 * Get the value of a cookie
 * @param mixed $name The name of the cookie
 * @return mixed The value of the cookie or null if not set
 */
function cookieGet($name)
{
   return $_COOKIE[$name] ?? null;
}

/**
 * Check if a cookie exists
 * @param mixed $name The name of the cookie
 * @return bool True if the cookie exists, false otherwise
 */
function cookieExists($name)
{
   return isset($_COOKIE[$name]);
}
