<?php
include '../secrets.php';

if ($conn->connect_error) {
   die("Connection failed: " . $conn->connect_error);
} else {
   $currentDateTime = new DateTime();
   $currentDateTime->setTimestamp(time());
   $currentDateTime = $currentDateTime->format('Y-m-d H:i:s');
   $sql = "DELETE FROM parties WHERE expires_at < '$currentDateTime'";
   $conn->query($sql);
   $conn->close();
}
