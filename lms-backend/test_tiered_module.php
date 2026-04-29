<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Course;
use App\Models\CourseModule;

// Add SQL Practice module with tiered blocks
$sqlModule = CourseModule::create([
    'course_id' => 1,
    'title' => 'SQL Practice - Tiered Learning (NEW)',
    'description' => 'Pelajaran berjenjang dengan praktik SQL langsung.',
    'content' => [
        'visual' => [
            'text' => 'Pelajaran ini menggunakan struktur berjenjang: Materi → Praktik → Materi → Praktik',
            'images' => [],
            'diagrams' => [],
        ],
        'auditory' => [
            'transcript' => 'Dengarkan penjelasan SQL...',
        ],
        'kinesthetic' => [
            'activityType' => 'tiered-blocks',
            'instructions' => 'Ikuti pelajaran berjenjang ini',
            'blocks' => [
                [
                    'id' => 'blk-1',
                    'type' => 'material',
                    'content' => 'SELECT adalah perintah untuk mengambil data dari tabel. Sintaks dasar: SELECT column FROM table;',
                ],
                [
                    'id' => 'blk-2',
                    'type' => 'practice-sql',
                    'instructions' => 'Coba SELECT untuk mengambil semua user dari tabel users',
                    'sampleSql' => 'SELECT * FROM users;',
                ],
                [
                    'id' => 'blk-3',
                    'type' => 'material',
                    'content' => 'WHERE clause digunakan untuk memfilter data dengan kondisi tertentu. Contoh: SELECT * FROM users WHERE role = "admin";',
                ],
                [
                    'id' => 'blk-4',
                    'type' => 'practice-sql',
                    'instructions' => 'Coba SELECT dengan WHERE untuk mencari user dengan role = "admin"',
                    'sampleSql' => 'SELECT * FROM users WHERE role = "admin";',
                ],
                [
                    'id' => 'blk-5',
                    'type' => 'material',
                    'content' => 'ORDER BY digunakan untuk mengurutkan hasil. DESC untuk descending, ASC untuk ascending (default). Contoh: SELECT * FROM products ORDER BY price DESC;',
                ],
                [
                    'id' => 'blk-6',
                    'type' => 'practice-sql',
                    'instructions' => 'Coba SELECT dengan ORDER BY untuk urutkan produk dari harga termahal',
                    'sampleSql' => 'SELECT * FROM products ORDER BY price DESC;',
                ],
            ],
        ],
    ],
]);

echo "✓ Module berhasil dibuat!\n";
echo "Module ID: " . $sqlModule->id . "\n";
echo "Title: " . $sqlModule->title . "\n";
echo "Activity Type: " . $sqlModule->content['kinesthetic']['activityType'] . "\n";
echo "Total Blocks: " . count($sqlModule->content['kinesthetic']['blocks']) . "\n";
