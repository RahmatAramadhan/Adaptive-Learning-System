<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insert courses
        DB::table('courses')->insert([
            [
                'title' => 'Basis Data (SMK - TKJ/RPL)',
                'description' => 'Pembelajaran Manajemen Basis Data mencakup DDL, DML, dan DCL sesuai kurikulum SMK.',
                'thumbnail' => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Web Development Fundamentals',
                'description' => 'Belajar dasar-dasar pemrograman web dengan HTML, CSS, dan JavaScript.',
                'thumbnail' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Insert course modules
        DB::table('course_modules')->insert([
            [
                'course_id' => 1,
                'title' => 'DDL (Data Definition Language)',
                'description' => 'Mendefinisikan struktur database: CREATE, ALTER, DROP.',
                'content' => json_encode([
                    'visual' => [
                        'text' => 'DDL adalah perintah untuk membuat dan memodifikasi struktur database.',
                        'images' => [],
                        'diagrams' => [],
                    ],
                    'auditory' => [
                        'audioUrl' => '',
                        'transcript' => 'Dengarkan penjelasan tentang DDL...',
                    ],
                    'kinesthetic' => [
                        'activityType' => 'drag-drop',
                        'instructions' => 'Urutkan perintah SQL yang benar',
                        'items' => ['CREATE', 'TABLE', 'users'],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => 1,
                'title' => 'DML (Data Manipulation Language)',
                'description' => 'Manipulasi data: SELECT, INSERT, UPDATE, DELETE.',
                'content' => json_encode([
                    'visual' => [
                        'text' => 'DML adalah perintah untuk memanipulasi data dalam database.',
                        'images' => [],
                        'diagrams' => [],
                    ],
                    'auditory' => [
                        'audioUrl' => '',
                        'transcript' => 'Penjelasan tentang DML...',
                    ],
                    'kinesthetic' => [
                        'activityType' => 'drag-drop',
                        'instructions' => 'Urutkan query SELECT yang benar',
                        'items' => ['SELECT', '*', 'FROM', 'users'],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => 1,
                'title' => 'DCL (Data Control Language)',
                'description' => 'Kontrol akses dan keamanan: GRANT, REVOKE.',
                'content' => json_encode([
                    'visual' => [
                        'text' => 'DCL adalah perintah untuk mengatur hak akses pengguna.',
                        'images' => [],
                        'diagrams' => [],
                    ],
                    'auditory' => [
                        'audioUrl' => '',
                        'transcript' => 'Penjelasan tentang DCL...',
                    ],
                    'kinesthetic' => [
                        'activityType' => 'drag-drop',
                        'instructions' => 'Pilih perintah DCL yang tepat',
                        'items' => ['GRANT', 'REVOKE'],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => 2,
                'title' => 'Intro to HTML',
                'description' => 'Belajar struktur dasar HTML untuk membuat halaman web.',
                'content' => json_encode([
                    'visual' => [
                        'text' => 'HTML adalah markup language untuk membuat halaman web.',
                        'images' => [],
                        'diagrams' => [],
                    ],
                    'auditory' => [
                        'audioUrl' => '',
                        'transcript' => 'Penjelasan tentang HTML...',
                    ],
                    'kinesthetic' => [
                        'activityType' => 'drag-drop',
                        'instructions' => 'Urutkan struktur HTML yang benar',
                        'items' => ['<html>', '<head>', '<body>', '</body>', '</html>'],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
