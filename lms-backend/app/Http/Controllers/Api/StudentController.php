<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentProgress;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        $students = User::where('role', 'siswa')
            ->with('learningStyle')
            ->get()
            ->map(fn($u) => [
                'id'             => $u->id,
                'name'           => $u->name,
                'email'          => $u->email,
                'learning_style' => $u->learningStyle?->result,
            ]);

        return response()->json($students);
    }

    public function progress($id)
    {
        $progress = StudentProgress::where('user_id', $id)->get();
        return response()->json($progress);
    }

    public function updateProgress(Request $request)
    {
        $request->validate([
            'course_id'  => 'required',
            'module_id'  => 'required',
            'completed'  => 'required|boolean',
            'score'      => 'nullable|numeric',
            'time_spent' => 'nullable|integer',
        ]);

        $progress = StudentProgress::updateOrCreate(
            [
                'user_id'   => $request->user()->id,
                'course_id' => $request->course_id,
                'module_id' => $request->module_id,
            ],
            [
                'completed' => $request->completed,
                'score'     => $request->score,
                'time_spent' => $request->time_spent ?? 0,
            ]
        );

        return response()->json($progress);
    }

    public function myProgress(Request $request)
    {
        $progress = StudentProgress::where('user_id', $request->user()->id)->get();
        return response()->json($progress);
    }

    public function stats(Request $request)
    {
        $userId = $request->user()->id;
        
        $progress = StudentProgress::where('user_id', $userId)->get();
        
        // Courses in progress: distinct courses with at least one progress entry
        $coursesInProgress = $progress->pluck('course_id')->unique()->count();
        
        // Learning time: sum of time_spent (in seconds)
        $totalTimeSpent = $progress->sum('time_spent');
        
        // Modules completed: count of completed modules
        $modulesCompleted = $progress->where('completed', true)->count();
        
        // Calculate learning time in hours and minutes
        $hours = intdiv($totalTimeSpent, 3600);
        $minutes = intdiv($totalTimeSpent % 3600, 60);
        $learningTimeFormatted = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";
        
        return response()->json([
            'courses_in_progress' => $coursesInProgress,
            'learning_time_seconds' => $totalTimeSpent,
            'learning_time_formatted' => $learningTimeFormatted,
            'modules_completed' => $modulesCompleted,
        ]);
    }
}
