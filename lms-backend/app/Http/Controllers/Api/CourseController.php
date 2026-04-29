<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with('modules')->get()
            ->map(fn($course) => [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'thumbnail' => $course->thumbnail,
                'created_by' => $course->created_by,
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at,
                'modules' => $course->modules->map(fn($m) => [
                    'id' => $m->id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'content' => $m->content,
                ])->toArray(),
            ])->toArray();
        return response()->json($courses);
    }

    public function show($id)
    {
        $course = Course::with('modules')->findOrFail($id);
        return response()->json([
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'thumbnail' => $course->thumbnail,
            'created_by' => $course->created_by,
            'created_at' => $course->created_at,
            'updated_at' => $course->updated_at,
            'modules' => $course->modules->map(fn($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'description' => $m->description,
                'content' => $m->content,
            ])->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail'   => 'nullable|string',
            'modules'     => 'nullable|array',
        ]);

        $course = Course::create([
            'title'       => $request->title,
            'description' => $request->description,
            'thumbnail'   => $request->thumbnail ?? '',
            'created_by'  => $request->user()->id,
        ]);

        if ($request->filled('modules') && is_array($request->modules)) {
            foreach ($request->modules as $mod) {
                // Langsung simpan sebagai array — model cast 'array' akan encode sendiri
                $course->modules()->create([
                    'title'       => $mod['title'] ?? '',
                    'description' => $mod['description'] ?? '',
                    'content'     => $mod['content'] ?? [],
                ]);
            }
        }

        $course = $course->load('modules');
        return response()->json([
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'thumbnail' => $course->thumbnail,
            'created_by' => $course->created_by,
            'created_at' => $course->created_at,
            'updated_at' => $course->updated_at,
            'modules' => $course->modules->map(fn($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'description' => $m->description,
                'content' => $m->content,
            ])->toArray(),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $course->update($request->only(['title', 'description', 'thumbnail']));

        // HANYA update modules jika field modules ada dan tidak kosong
        // Ini mencegah accidental deletion saat edit course tanpa modules
        if ($request->has('modules') && is_array($request->modules) && count($request->modules) > 0) {
            $course->modules()->delete();
            foreach ($request->modules as $mod) {
                $course->modules()->create([
                    'title'       => $mod['title'] ?? '',
                    'description' => $mod['description'] ?? '',
                    'content'     => $mod['content'] ?? [],
                ]);
            }
        }

        $course = $course->load('modules');
        return response()->json([
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'thumbnail' => $course->thumbnail,
            'created_by' => $course->created_by,
            'created_at' => $course->created_at,
            'updated_at' => $course->updated_at,
            'modules' => $course->modules->map(fn($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'description' => $m->description,
                'content' => $m->content,
            ])->toArray(),
        ]);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->modules()->delete();
        $course->delete();
        return response()->json(['message' => 'Course deleted.']);
    }
}
