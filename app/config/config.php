<?php
/**********************************************
 *      FlightPHP Takalo-takalo Config        *
 **********************************************
 *
 * Configuration principale de l'application
 * ⚠️ NE JAMAIS COMMITER CE FICHIER SUR GIT avec les vrais credentials
 *
 **********************************************/

/**********************************************
 *         Application Environment            *
 **********************************************/

// Directory Separator
$ds = DIRECTORY_SEPARATOR;

// Set your timezone
date_default_timezone_set('Indian/Antananarivo');

// Error reporting level
error_reporting(E_ALL);

// Character encoding
if (function_exists('mb_internal_encoding') === true) {
    mb_internal_encoding('UTF-8');
}

// Default Locale
if (function_exists('setlocale') === true) {
    setlocale(LC_ALL, 'fr_FR.UTF-8');
}

/**********************************************
 *           FlightPHP Core Settings          *
 **********************************************/

// Get the $app var to use below
if (empty($app) === true) {
    $app = Flight::app();
}

// Autoload classes from app directory
$app->path(__DIR__ . $ds . '..' . $ds . '..');

// Core config variables
$app->set('flight.base_url', '/');
$app->set('flight.case_sensitive', false);
$app->set('flight.log_errors', true);
$app->set('flight.handle_errors', false);
$app->set('flight.views.path', __DIR__ . $ds . '..' . $ds . 'views');
$app->set('flight.views.extension', '.php');
$app->set('flight.content_length', false);

// Generate a CSP nonce for each request
$nonce = bin2hex(random_bytes(16));
$app->set('csp_nonce', $nonce);

/**********************************************
 *           User Configuration               *
 **********************************************/
return [
	/**************************************
	 *         Database Settings          *
	 **************************************/
	'database' => [
		// MySQL Example:
		 'host'     => '127.0.0.1',      // Database host (e.g., 'localhost', 'db.example.com')
		 'dbname'   => 'bngrc',   // Database name (e.g., 'flightphp')
		 'user'     => 'root',  // Database user (e.g., 'root')
		 'password' => '',  // Database password (never commit real passwords)

		// SQLite Example:
		// 'file_path' => __DIR__ . $ds . '..' . $ds . 'database.sqlite', // Path to SQLite file
	],

	// Google OAuth Credentials
	// 'google_oauth' => [
	//     'client_id'     => 'your_client_id',     // Google API client ID
	//     'client_secret' => 'your_client_secret', // Google API client secret
	//     'redirect_uri'  => 'your_redirect_uri',  // Redirect URI for OAuth callback
	// ],

	// Add more configuration sections below as needed
];
