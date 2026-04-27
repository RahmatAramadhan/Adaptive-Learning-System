<?php
use Illuminate\Support\Facades\Route;

/**
 * Web Routes - All UI handled by React frontend
 * Laravel is API-only backend
 * React runs on http://localhost:3000 and calls API endpoints
 */

Route::get('/', fn() => response()->json(['message' => 'LMS API - Use React frontend on port 3000']));

// Fallback untuk menginformasikan user bahwa ini adalah API saja
Route::fallback(fn() => response()->json(['error' => 'Endpoint not found. Use /api/* for API endpoints.'], 404));
