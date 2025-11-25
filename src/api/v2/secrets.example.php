<?php
// Spotify API credentials
global $spotifyClientId;
$spotifyClientId = 'YOUR_SPOTIFY_CLIENT_ID';
global $spotifyClientSecret;
$spotifyClientSecret = 'YOUR_SPOTIFY_CLIENT_SECRET';
// Database credentials
$host = 'YOUR_DATABASE_HOST';
$user = 'YOUR_DATABASE_USER';
$pass = 'YOUR_DATABASE_PASSWORD';
$db = 'YOUR_DATABASE_NAME';
$port = 'YOUR_DATABASE_PORT';
// Database connection
global $conn;
$conn = new mysqli($host, $user, $pass, $db, $port);
// Allowed domain for CORS
global $allowedDomain;
$allowedDomain = 'https://url.com';