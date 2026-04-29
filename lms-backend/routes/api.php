<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\QuestionnaireController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

// ── Handle CORS preflight ────────────────────────────────────────────────────
Route::options('{any}', function () {
    return response()->json(null, 204);
})->where('any', '.*');

// ── Public routes ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Protected routes ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── File Upload ──────────────────────────────────────────────────────────
    Route::post('/upload', [UploadController::class, 'store']);

    // ── Kuesioner (siswa) ────────────────────────────────────────────────────
    Route::get('/questionnaire/status', [QuestionnaireController::class, 'status']);
    Route::post('/questionnaire/submit', [QuestionnaireController::class, 'submit']);

    // ── Courses ──────────────────────────────────────────────────────────────
    Route::get('/courses',         [CourseController::class, 'index']);
    Route::get('/courses/{id}',    [CourseController::class, 'show']);

    // Guru only
    Route::middleware('role:guru')->group(function () {
        Route::post('/courses',        [CourseController::class, 'store']);
        Route::put('/courses/{id}',    [CourseController::class, 'update']);
        Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

        Route::get('/modules',                              [ModuleController::class, 'index']);
        Route::post('/modules',                             [ModuleController::class, 'store']);
        Route::post('/courses/{courseId}/modules',          [ModuleController::class, 'store']);
        Route::put('/courses/{courseId}/modules/{moduleId}', [ModuleController::class, 'update']);
        Route::delete('/courses/{courseId}/modules/{moduleId}', [ModuleController::class, 'destroy']);

        Route::post('/evaluations',        [EvaluationController::class, 'store']);
        Route::put('/evaluations/{id}',    [EvaluationController::class, 'update']);
        Route::delete('/evaluations/{id}', [EvaluationController::class, 'destroy']);
        Route::get('/evaluations/{id}/student-results', [EvaluationController::class, 'getStudentResults']);

        Route::get('/students',              [StudentController::class, 'index']);
        Route::get('/students/{id}/progress', [StudentController::class, 'progress']);
    });

    // ── Evaluations (siswa submit) ────────────────────────────────────────────
    Route::get('/evaluations',              [EvaluationController::class, 'index']);
    Route::get('/evaluations/{id}',         [EvaluationController::class, 'show']);
    Route::get('/courses/{courseId}/modules/{moduleId}/evaluations', [EvaluationController::class, 'indexByModule']);
    Route::post('/evaluations/{id}/submit', [EvaluationController::class, 'submitAnswer']);
    Route::get('/my-evaluation-results',    [EvaluationController::class, 'myResults']);

    // ── Progress ──────────────────────────────────────────────────────────────
    Route::post('/progress', [StudentController::class, 'updateProgress']);
    Route::get('/progress',  [StudentController::class, 'myProgress']);
    Route::get('/stats', [StudentController::class, 'stats']);
});
