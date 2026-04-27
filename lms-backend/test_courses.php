<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

// Test with Eloquent
$courseModel = \App\Models\Course::with('modules')->get();
echo "Eloquent Model Result:\n";
echo json_encode($courseModel, JSON_PRETTY_PRINT) . "\n\n";

// Test the mapped version (as per CourseController)
$mapped = $courseModel->map(fn($course) => [
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

echo "Mapped Result (as per CourseController):\n";
echo "Total courses: " . count($mapped) . "\n";
foreach ($mapped as $course) {
    echo "Course: {$course['title']} - Modules: " . count($course['modules']) . "\n";
}
echo json_encode($mapped, JSON_PRETTY_PRINT) . "\n";

