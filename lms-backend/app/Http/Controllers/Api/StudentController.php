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
            ->with([
                'learningStyle',
                'class',
                'bmwMapping' 
            ])
            ->get()
            ->map(fn($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'learning_style' => $student->learningStyle?->result,
                'class' => $student->class ? [
                    'id' => $student->class->id,
                    'name' => $student->class->name,
                ] : null,

                'bmw_mapping' => $student->bmwMapping ? [
                    'dominant_result' => $student->bmwMapping->dominant_result,
                    'bekerja_score' => $student->bmwMapping->bekerja_score,
                    'melanjutkan_score' => $student->bmwMapping->melanjutkan_score,
                    'wirausaha_score' => $student->bmwMapping->wirausaha_score,
                    'open_answers' => $student->bmwMapping->open_answers,
                ] : null,
            ])
            ->toArray();

        return response()->json($students);
    }


    public function progress($id)
    {
        $progress = StudentProgress::where('user_id', $id)
            ->get();

        return response()->json($progress);
    }


    public function updateProgress(Request $request)
    {
        $request->validate([
            'course_id' => 'required',
            'module_id' => 'required',
            'completed' => 'required|boolean',
            'score' => 'nullable|numeric',
            'time_spent' => 'nullable|integer',
        ]);


        $progress = StudentProgress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'course_id' => $request->course_id,
                'module_id' => $request->module_id,
            ],
            [
                'completed' => $request->completed,
                'score' => $request->score,
                'time_spent' => $request->time_spent ?? 0,
            ]
        );


        return response()->json($progress);
    }


    public function myProgress(Request $request)
    {
        $progress = StudentProgress::where(
                'user_id',
                $request->user()->id
            )
            ->get();

        return response()->json($progress);
    }


    public function stats(Request $request)
    {
        $progress = StudentProgress::where(
                'user_id',
                $request->user()->id
            )
            ->get();


        $coursesInProgress = $progress
            ->pluck('course_id')
            ->unique()
            ->count();


        $totalTimeSpent = $progress->sum('time_spent');


        $modulesCompleted = $progress
            ->where('completed', true)
            ->count();


        $hours = intdiv($totalTimeSpent, 3600);

        $minutes = intdiv(
            $totalTimeSpent % 3600,
            60
        );


        $learningTimeFormatted =
            $hours > 0
                ? "{$hours}h {$minutes}m"
                : "{$minutes}m";


        return response()->json([
            'courses_in_progress' => $coursesInProgress,
            'learning_time_seconds' => $totalTimeSpent,
            'learning_time_formatted' => $learningTimeFormatted,
            'modules_completed' => $modulesCompleted,
        ]);
    }


    public function updateStudent(Request $request, $id)
    {
        // 1. Tambahkan validasi password nullable
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'class_id' => 'nullable|exists:classes,id',
            'password' => 'nullable|string|min:8', 
        ]);

        $student = User::where('role', 'siswa')
            ->findOrFail($id);

        // 2. Siapkan data dasar yang akan diupdate
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'class_id' => $request->class_id,
        ];

        // 3. Jika password diisi di frontend, enkripsi dan tambahkan ke array update
        if ($request->filled('password')) {
            $updateData['password'] = bcrypt($request->password);
        }

        $student->update($updateData);

        // 4. Muat ulang relasi, pastikan bmwMapping ikut dimuat
        $student->load([
            'learningStyle',
            'class',
            'bmwMapping' 
        ]);

        // 5. Kembalikan respons beserta data BMW agar tabel tidak error/kosong
        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'learning_style' => $student->learningStyle?->result,
            'class' => $student->class ? [
                'id' => $student->class->id,
                'name' => $student->class->name,
            ] : null,
            'bmw_mapping' => $student->bmwMapping ? [
                'dominant_result' => $student->bmwMapping->dominant_result,
                'bekerja_score' => $student->bmwMapping->bekerja_score,
                'melanjutkan_score' => $student->bmwMapping->melanjutkan_score,
                'wirausaha_score' => $student->bmwMapping->wirausaha_score,
                'open_answers' => $student->bmwMapping->open_answers,
            ] : null,
        ]);
    }


    public function deleteStudent($id)
    {
        $student = User::where('role', 'siswa')
            ->findOrFail($id);


        StudentProgress::where('user_id', $id)
            ->delete();


        $student->delete();


        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }


    public function storeStudent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'class_id' => 'nullable|exists:classes,id',
        ]);


        $student = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'siswa',
            'class_id' => $request->class_id,
        ]);


        $student->load('class');


        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'learning_style' => null,
            'class' => $student->class ? [
                'id' => $student->class->id,
                'name' => $student->class->name,
            ] : null,
        ], 201);
    }


    public function assignClass(Request $request, $id)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
        ]);


        $student = User::where('role', 'siswa')
            ->findOrFail($id);


        $student->update([
            'class_id' => $request->class_id,
        ]);


        return response()->json([
            'message' => 'Class assigned successfully'
        ]);
    }


    public function selectClass(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
        ]);


        $student = $request->user();


        $student->update([
            'class_id' => $request->class_id,
        ]);


        $student->load('class');


        return response()->json([
            'message' => 'Class selected successfully',
            'class' => [
                'id' => $student->class->id,
                'name' => $student->class->name,
            ],
        ]);
    }

    public function showStudent($id)
    {
        $student = User::where('role', 'siswa')
            ->with(['class', 'learningStyle', 'bmwMapping'])
            ->findOrFail($id);

        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'class' => $student->class ? [
                'name' => $student->class->name,
            ] : null,
            'bmw_mapping' => $student->bmwMapping ? [
                'dominant_result' => $student->bmwMapping->dominant_result,
                'bekerja_score' => $student->bmwMapping->bekerja_score,
                'melanjutkan_score' => $student->bmwMapping->melanjutkan_score,
                'wirausaha_score' => $student->bmwMapping->wirausaha_score,
                'open_answers' => $student->bmwMapping->open_answers,
                'closed_answers' => $student->bmwMapping->closed_answers,
            ] : null,
        ]);
    }
}