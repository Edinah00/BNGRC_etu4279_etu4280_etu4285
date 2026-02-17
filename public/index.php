<?php
$ds = DIRECTORY_SEPARATOR;

define('BASE_URL', rtrim(dirname($_SERVER['SCRIPT_NAME']), '/'));

require(__DIR__ . $ds . '..' . $ds . 'app' . $ds . 'config' . $ds . 'bootstrap.php');
