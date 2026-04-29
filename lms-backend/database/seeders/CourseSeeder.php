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
            [
                'course_id' => 1,
                'title' => 'DDL Practice - Tiered Learning',
                'description' => 'Pelajaran berjenjang dengan praktik DDL langsung.',
                'content' => json_encode([
                    'visual' => [
                        'text' => 'Pelajaran ini menggunakan struktur berjenjang: Materi DDL → Praktik CREATE → Materi ALTER → Praktik ALTER → Materi RENAME/DROP → Praktik Final',
                        'images' => [],
                        'diagrams' => [],
                    ],
                    'auditory' => [
                        'transcript' => 'Dengarkan penjelasan tentang DDL, yaitu pembuatan dan pengaturan struktur basis data.',
                    ],
                    'kinesthetic' => [
                        'activityType' => 'tiered-blocks',
                        'instructions' => 'Ikuti pelajaran berjenjang ini dan fokus pada perintah DDL.',
                        'blocks' => [
                            [
                                'id' => 'blk-1',
                                'type' => 'material',
                                'content' => 'DDL digunakan untuk mendefinisikan struktur database, seperti CREATE, ALTER, RENAME, DROP, dan TRUNCATE. Fokusnya bukan pada isi data, tetapi pada wadah penyimpanannya.',
                            ],
                            [
                                'id' => 'blk-2',
                                'type' => 'practice-sql',
                                'instructions' => 'Buat tabel siswa sesuai materi: id_siswa, nis, nama_lengkap, jenis_kelamin, tanggal_lahir, dan alamat.',
                                'sampleSql' => "CREATE TABLE siswa (\n  id_siswa INT AUTO_INCREMENT PRIMARY KEY,\n  nis VARCHAR(10) UNIQUE NOT NULL,\n  nama_lengkap VARCHAR(100) NOT NULL,\n  jenis_kelamin ENUM('L', 'P'),\n  tanggal_lahir DATE,\n  alamat TEXT\n);",
                            ],
                            [
                                'id' => 'blk-3',
                                'type' => 'material',
                                'content' => 'ALTER TABLE digunakan untuk mengubah struktur tabel tanpa menghapus tabelnya. Contohnya menambah kolom, mengubah tipe data, atau mengganti nama kolom.',
                            ],
                            [
                                'id' => 'blk-4',
                                'type' => 'practice-sql',
                                'instructions' => 'Tambahkan kolom no_telepon ke tabel siswa dengan tipe VARCHAR(15).',
                                'sampleSql' => 'ALTER TABLE siswa ADD no_telepon VARCHAR(15);',
                            ],
                            [
                                'id' => 'blk-5',
                                'type' => 'material',
                                'content' => 'Perintah RENAME, DROP, dan TRUNCATE juga termasuk DDL. RENAME mengganti nama tabel, DROP menghapus struktur secara permanen, dan TRUNCATE mengosongkan isi tabel sambil mempertahankan strukturnya.',
                            ],
                            [
                                'id' => 'blk-6',
                                'type' => 'practice-sql',
                                'instructions' => 'Coba ubah nama tabel siswa menjadi data_siswa, lalu kosongkan tabelnya.',
                                'sampleSql' => 'RENAME TABLE siswa TO data_siswa;',
                            ],
                        ],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
