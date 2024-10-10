<?php
include '../secrets.php';

if ($conn->connect_error) {
   die("Connection failed: " . $conn->connect_error);
} else {
   $sql = 'DELETE FROM parties WHERE party_expires_at < NOW()';
   $conn->query($sql);
}
