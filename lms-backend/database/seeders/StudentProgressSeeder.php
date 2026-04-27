<?php

namespace Database\Seeders;

use App\Models\StudentProgress;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentProgressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample progress data for student user (assuming user_id = 2 is a student)
        StudentProgress::create([
            'user_id' => 2,
            'course_id' => 1,
            'module_id' => 1,
            'completed' => true,
            'score' => 85,
            'time_spent' => 3600, // 1 hour
        ]);

        StudentProgress::create([
            'user_id' => 2,
            'course_id' => 1,
            'module_id' => 2,
            'completed' => true,
            'score' => 90,
            'time_spent' => 4800, // 1.33 hours
        ]);

        StudentProgress::create([
            'user_id' => 2,
            'course_id' => 1,
            'module_id' => 3,
            'completed' => false,
            'score' => 0,
            'time_spent' => 1800, // 0.5 hours
        ]);

        StudentProgress::create([
            'user_id' => 2,
            'course_id' => 2,
            'module_id' => 4,
            'completed' => true,
            'score' => 88,
            'time_spent' => 3200, // 0.89 hours
        ]);
    }
}
