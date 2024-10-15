<?php
// Spotify API credentials
global $spotifyClientId;
$spotifyClientId = '67fa8a1f5eec455495394d8429fede37';
global $spotifyClientSecret;
$spotifyClientSecret = '282380b244c54d8dbd31a74a4a49ae8b';
// Database credentials
$host = 'localhost';
$user = 'aw1443_housePartyController';
$pass = 'qHzzdp^)D+v-WO&3z^';
$db = 'aw1443_houseParty';
$port = '3306';

global $conn;
$conn = new mysqli($host, $user, $pass, $db, $port);
