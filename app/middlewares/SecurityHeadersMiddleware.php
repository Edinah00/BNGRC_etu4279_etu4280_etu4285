<?php
declare(strict_types=1);

namespace app\middlewares;

use flight\Engine;
use Tracy\Debugger;

class SecurityHeadersMiddleware
{
	protected Engine $app;

	public function __construct(Engine $app)
	{
		$this->app = $app;
	}
	
	public function before(array $params): void
	{
		$nonce = $this->app->get('csp_nonce');
		$host = $_SERVER['HTTP_HOST'] ?? '';
		$appEnv = $_SERVER['APP_ENV'] ?? '';
		$isDev = str_contains($host, 'localhost')
			|| str_contains($host, '127.0.0.1')
			|| $appEnv === 'dev';

		// development mode to execute Tracy debug bar CSS
		$tracyCssBypass = "'nonce-{$nonce}'";
		if(Debugger::$showBar === true) {
			$tracyCssBypass = ' \'unsafe-inline\'';
		}

		if ($isDev) {
			$csp = "default-src 'self'; "
				. "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; "
				. "style-src 'self' 'unsafe-inline' http://localhost:5173 https://fonts.googleapis.com; "
				. "font-src 'self' https://fonts.gstatic.com data:; "
				. "img-src 'self' data:; "
				. "worker-src 'self' blob:; "
				. "connect-src 'self' http://localhost:5173 ws://localhost:5173;";
		} else {
			$csp = "default-src 'self'; "
				. "script-src 'self' 'nonce-{$nonce}' 'strict-dynamic'; "
				. "style-src 'self' {$tracyCssBypass} https://fonts.googleapis.com; "
				. "font-src 'self' https://fonts.gstatic.com data:; "
				. "img-src 'self' data:;";
		}
		$this->app->response()->header('X-Frame-Options', 'SAMEORIGIN');
		$this->app->response()->header("Content-Security-Policy", $csp);
		$this->app->response()->header('X-XSS-Protection', '1; mode=block');
		$this->app->response()->header('X-Content-Type-Options', 'nosniff');
		$this->app->response()->header('Referrer-Policy', 'no-referrer-when-downgrade');
		$this->app->response()->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
		$this->app->response()->header('Permissions-Policy', 'geolocation=()');
	}
}
