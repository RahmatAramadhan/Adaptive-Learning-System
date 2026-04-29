<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        $modules = CourseModule::with('course:id,title')->get()
            ->map(fn($m) => [
                'id'          => $m->id,
                'title'       => $m->title,
                'description' => $m->description,
                'course_id'   => $m->course_id,
                'course_name' => $m->course->title,
                'created_at'  => $m->created_at,
            ]);

        return response()->json($modules);
    }

    public function store(Request $request, $courseId = null)
    {
        // Handle both POST /modules (course_id in body) dan POST /courses/{id}/modules (courseId in URL)
        $actualCourseId = $courseId ?? $request->input('course_id');
        
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'content'     => 'nullable|array',
        ]);

        // Verify course exists
        Course::findOrFail($actualCourseId);

        $module = CourseModule::create([
            'course_id'   => $actualCourseId,
            'title'       => $request->title,
            'description' => $request->description,
            'content'     => $request->input('content', []),
        ]);

        return response()->json($module, 201);
    }

    public function update(Request $request, $courseId, $moduleId)
    {
        $course = Course::findOrFail($courseId);
        $module = $course->modules()->findOrFail($moduleId);

        $request->validate([
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'content'     => 'nullable|array',
        ]);

        $module->update($request->only(['title', 'description', 'content']));

        return response()->json($module);
    }

    public function destroy($courseId, $moduleId)
    {
        $course = Course::findOrFail($courseId);
        $module = $course->modules()->findOrFail($moduleId);
        $module->delete();

        return response()->json(['message' => 'Module deleted successfully']);
    }
}
