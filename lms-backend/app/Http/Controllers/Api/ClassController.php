<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with('homeroomTeacher')
            ->withCount('students')
            ->get()
            ->map(fn($class) => [
                'id' => $class->id,
                'name' => $class->name,
                'grade' => $class->grade,
                'major' => $class->major,
                'academic_year' => $class->academic_year,
                'homeroom_teacher' => $class->homeroomTeacher ? [
                    'id' => $class->homeroomTeacher->id,
                    'name' => $class->homeroomTeacher->name,
                ] : null,
                'students_count' => $class->students_count,
            ])
            ->toArray();

        return response()->json($classes);
    }


    public function available()
    {
        $classes = SchoolClass::select(
                'id',
                'name',
                'grade',
                'major',
                'academic_year'
            )
            ->get();

        return response()->json($classes);
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:classes,name',
            'grade' => 'required|in:X,XI,XII',
            'major' => 'required|string',
            'academic_year' => 'required|string',
            'homeroom_teacher_id' => 'nullable|exists:users,id',
        ]);


        if ($request->homeroom_teacher_id) {

            $teacher = User::find($request->homeroom_teacher_id);

            if (!$teacher || $teacher->role !== 'guru') {
                return response()->json([
                    'message' => 'Selected user is not a teacher'
                ], 422);
            }
        }


        $class = SchoolClass::create([
            'name' => $request->name,
            'grade' => $request->grade,
            'major' => $request->major,
            'academic_year' => $request->academic_year,
            'homeroom_teacher_id' => $request->homeroom_teacher_id,
        ]);


        $class->load('homeroomTeacher');


        return response()->json([
            'id' => $class->id,
            'name' => $class->name,
            'grade' => $class->grade,
            'major' => $class->major,
            'academic_year' => $class->academic_year,
            'homeroom_teacher' => $class->homeroomTeacher ? [
                'id' => $class->homeroomTeacher->id,
                'name' => $class->homeroomTeacher->name,
            ] : null,
        ], 201);
    }


    public function update(Request $request, $id)
    {
        $class = SchoolClass::findOrFail($id);

        $request->validate([
            'name' => 'required|unique:classes,name,' . $id,
            'grade' => 'required|in:X,XI,XII',
            'major' => 'required|string',
            'academic_year' => 'required|string',
            'homeroom_teacher_id' => 'nullable|exists:users,id',
        ]);


        if ($request->homeroom_teacher_id) {

            $teacher = User::find($request->homeroom_teacher_id);

            if (!$teacher || $teacher->role !== 'guru') {
                return response()->json([
                    'message' => 'Selected user is not a teacher'
                ], 422);
            }
        }


        $class->update([
            'name' => $request->name,
            'grade' => $request->grade,
            'major' => $request->major,
            'academic_year' => $request->academic_year,
            'homeroom_teacher_id' => $request->homeroom_teacher_id,
        ]);


        $class->load('homeroomTeacher');


        return response()->json([
            'id' => $class->id,
            'name' => $class->name,
            'grade' => $class->grade,
            'major' => $class->major,
            'academic_year' => $class->academic_year,
            'homeroom_teacher' => $class->homeroomTeacher ? [
                'id' => $class->homeroomTeacher->id,
                'name' => $class->homeroomTeacher->name,
            ] : null,
        ]);
    }


    public function showStudents($id)
    {
        $class = SchoolClass::with('students.learningStyle')
            ->findOrFail($id);


        return response()->json([
            'id' => $class->id,
            'name' => $class->name,
            'students' => $class->students->map(fn($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'learning_style' => $student->learningStyle?->result,
            ])->toArray(),
        ]);
    }


    public function teachers()
    {
        $teachers = User::where('role', 'guru')
            ->select(
                'id',
                'name'
            )
            ->get();

        return response()->json($teachers);
    }


    public function destroy($id)
    {
        $class = SchoolClass::findOrFail($id);


        User::where('class_id', $id)
            ->update([
                'class_id' => null
            ]);


        $class->delete();


        return response()->json([
            'message' => 'Class deleted successfully'
        ]);
    }
}