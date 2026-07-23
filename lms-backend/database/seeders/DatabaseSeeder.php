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
            ['email' => 'idhenz@gmail.com'],
            [
                'name' => 'Hendra',
                'password' => Hash::make('Hendra123*'),
                'role' => 'guru',
            ]
        );

        // Seed courses and modules
        $this->call(CourseSeeder::class);

        // Seed student progress
        $this->call(StudentProgressSeeder::class);
    }
}
