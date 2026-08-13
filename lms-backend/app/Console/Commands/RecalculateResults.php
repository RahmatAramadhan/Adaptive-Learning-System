<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LearningStyles;
use App\Models\BmwMapping;

class RecalculateResults extends Command
{
    // Nama perintah yang akan diketik di terminal
    protected $signature = 'app:recalculate-results';

    // Deskripsi perintah
    protected $description = 'Mengkalkulasi ulang hasil dominan Gaya Belajar dan BMW yang salah akibat bug seri (tie).';

    public function handle()
    {
        $this->info('Memulai kalkulasi ulang data Gaya Belajar...');
        
        // 1. Perbaiki Gaya Belajar
        $styles = LearningStyles::all();
        $styleUpdated = 0;
        
        foreach ($styles as $style) {
            $scores = [
                'Visual'     => $style->visual_percentage,
                'Auditori'   => $style->auditory_percentage,
                'Kinestetik' => $style->kinesthetic_percentage,
            ];
            
            $maxScore = max($scores);
            $winners = array_keys($scores, $maxScore);
            $correctResult = implode(' & ', $winners);
            
            if ($style->result !== $correctResult) {
                $style->result = $correctResult;
                $style->save();
                $styleUpdated++;
            }
        }
        $this->info("Selesai! $styleUpdated data Gaya Belajar telah dikoreksi.");

        $this->info('Memulai kalkulasi ulang data BMW...');

        // 2. Perbaiki BMW
        // (Pastikan nama model BmwMapping sesuai dengan yang Anda gunakan di aplikasi)
        if (class_exists(BmwMapping::class)) {
            $bmws = BmwMapping::all();
            $bmwUpdated = 0;
            
            foreach ($bmws as $bmw) {
                $scores = [
                    'Bekerja'     => $bmw->bekerja_score,
                    'Melanjutkan' => $bmw->melanjutkan_score,
                    'Wirausaha'   => $bmw->wirausaha_score,
                ];
                
                $maxScore = max($scores);
                $winners = array_keys($scores, $maxScore);
                $correctResult = implode(' / ', $winners);
                
                if ($bmw->dominant_result !== $correctResult) {
                    $bmw->dominant_result = $correctResult;
                    $bmw->save();
                    $bmwUpdated++;
                }
            }
            $this->info("Selesai! $bmwUpdated data BMW telah dikoreksi.");
        } else {
            $this->warn("Model BmwMapping tidak ditemukan, lewati perbaikan BMW.");
        }

        $this->info('Semua data berhasil direkalkulasi!');
    }
}