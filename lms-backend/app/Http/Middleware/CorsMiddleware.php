<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = config('cors.allowed_origins', []);
        $origin = $request->header('Origin');

        // Always allow in allowedOrigins
        $isAllowed = in_array($origin, $allowedOrigins);

        // Handle CORS preflight
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 204);
        } else {
            $response = $next($request);
        }

        // Add CORS headers if origin is allowed
        if ($isAllowed) {
            $response->header('Access-Control-Allow-Origin', $origin)
                     ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                     ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
                     ->header('Access-Control-Allow-Credentials', 'true')
                     ->header('Access-Control-Max-Age', '3600');
        }

        return $response;
    }
}
