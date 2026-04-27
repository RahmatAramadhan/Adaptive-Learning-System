<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create teacher
        User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Mr. Teacher',
                'password' => Hash::make('password'),
                'role' => 'guru',
            ]
        );

        // Create student
        User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Student User',
                'password' => Hash::make('password'),
                'role' => 'siswa',
            ]
        );

        // Create another student
        User::firstOrCreate(
            ['email' => 'student2@example.com'],
            [
                'name' => 'Another Student',
                'password' => Hash::make('password'),
                'role' => 'siswa',
            ]
        );

        // Seed courses and modules
        $this->call(CourseSeeder::class);

        // Seed student progress
        $this->call(StudentProgressSeeder::class);
    }
}
