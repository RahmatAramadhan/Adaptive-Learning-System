<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BmwMapping;
use Illuminate\Http\Request;

class BmwMappingController extends Controller
{
    public function submit(Request $request)
    {
        $request->validate([
            'open_answers' => 'required|array',
            'answers'      => 'required|array',
        ]);

        $answers = $request->answers;
        
        $bekerjaScore     = 0;
        $melanjutkanScore = 0;
        $wirausahaScore   = 0;

        // Hitung skor berdasarkan prefix 'b_', 'm_', dan 'w_'
        foreach ($answers as $key => $value) {
            if ($value == 1) {
                if (str_starts_with($key, 'b_')) $bekerjaScore++;
                if (str_starts_with($key, 'm_')) $melanjutkanScore++;
                if (str_starts_with($key, 'w_')) $wirausahaScore++;
            }
        }

        $scores = [
            'Bekerja'     => $bekerjaScore,
            'Melanjutkan' => $melanjutkanScore,
            'Wirausaha'   => $wirausahaScore,
        ];

        if ($bekerjaScore == 15 && $melanjutkanScore == 15 && $wirausahaScore == 15) {
            return response()->json([
                'message' => 'Wah, sepertinya kamu memilih "Ya" untuk semua pilihan. Yuk, coba lebih fokus pada hal yang paling sesuai dengan rencanamu dan isi dengan sungguh-sungguh!'
            ], 422);
        }

        if ($bekerjaScore == 0 && $melanjutkanScore == 0 && $wirausahaScore == 0) {
            return response()->json([
                'message' => 'Skormu 0% di semua bidang! Pasti ada minimal satu arah karier yang kamu minati. Silakan baca dan isi ulang dengan sungguh-sungguh ya.'
            ], 422);
        }

        $maxScore = max($scores);
        $winners = array_keys($scores, $maxScore);
        $dominantResult = implode(' & ', $winners);
        
        // Cari nilai tertinggi untuk menentukan yang paling dominan
        $maxScore = max($scores);
        $winners = array_keys($scores, $maxScore);
        $dominantResult = implode(' / ', $winners);

        $user = $request->user();

        // Hapus data lama jika siswa pernah mengisi sebelumnya
        BmwMapping::where('user_id', $user->id)->delete();

        // Simpan ke database
        $mapping = BmwMapping::create([
            'user_id'           => $user->id,
            'open_answers'      => $request->open_answers,
            'closed_answers'    => $request->answers, 
            'bekerja_score'     => $bekerjaScore,
            'melanjutkan_score' => $melanjutkanScore,
            'wirausaha_score'   => $wirausahaScore,
            'dominant_result'   => $dominantResult,
        ]);

        return response()->json([
            'message'     => 'Pemetaan BMW berhasil disimpan.',
            'bmw_mapping' => [
                'dominant_result'   => $dominantResult,
                'bekerja_score'     => $bekerjaScore,
                'melanjutkan_score' => $melanjutkanScore,
                'wirausaha_score'   => $wirausahaScore,
            ],
        ]);
    }

    public function reset($studentId)
    {
        // Hapus data BMW milik user_id tersebut
        $deleted = BmwMapping::where('user_id', $studentId)->delete();

        if ($deleted) {
            return response()->json([
                'message' => 'Data Pemetaan BMW berhasil direset. Siswa kini dapat mengisi ulang.'
            ]);
        }

        return response()->json([
            'message' => 'Data tidak ditemukan atau sudah kosong.'
        ], 404);
    }
}