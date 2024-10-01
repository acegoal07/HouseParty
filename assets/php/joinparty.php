<?php
include 'databaseConnection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   if (!isset($_GET['party-code'])) {
      header("Location: /houseparty/join.html");
   } else {
      
   }
}
