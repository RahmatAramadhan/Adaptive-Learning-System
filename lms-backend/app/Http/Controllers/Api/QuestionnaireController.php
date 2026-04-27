<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningStyles;
use Illuminate\Http\Request;

class QuestionnaireController extends Controller
{
    public function status(Request $request)
    {
        $user  = $request->user();
        $style = $user->learningStyle;

        return response()->json([
            'has_learning_style' => !is_null($style),
            'learning_style'     => $style ? [
                'result'                 => strtolower($style->result),
                'visual_percentage'      => $style->visual_percentage,
                'auditory_percentage'    => $style->auditory_percentage,
                'kinesthetic_percentage' => $style->kinesthetic_percentage,
            ] : null,
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'answers' => 'required|array|min:1',
        ]);

        $answers      = $request->answers; // ['q1' => 'a', 'q2' => 'b', ...]
        $visual       = 0;
        $auditory     = 0;
        $kinesthetic  = 0;

        foreach ($answers as $answer) {
            if ($answer === 'a') $visual++;
            if ($answer === 'b') $auditory++;
            if ($answer === 'c') $kinesthetic++;
        }

        $total  = count($answers);
        $vP     = round(($visual      / $total) * 100, 2);
        $aP     = round(($auditory    / $total) * 100, 2);
        $kP     = round(($kinesthetic / $total) * 100, 2);

        $result = 'Visual';
        if ($aP > $vP && $aP > $kP) $result = 'Auditori';
        if ($kP > $vP && $kP > $aP) $result = 'Kinestetik';

        $user  = $request->user();

        // Hapus style lama jika ada
        LearningStyles::where('user_id', $user->id)->delete();

        $style = LearningStyles::create([
            'user_id'                => $user->id,
            'result'                 => $result,
            'visual_percentage'      => $vP,
            'auditory_percentage'    => $aP,
            'kinesthetic_percentage' => $kP,
        ]);

        $user->learning_style_id = $style->id;
        $user->save();

        return response()->json([
            'message'        => 'Gaya belajar berhasil disimpan.',
            'learning_style' => [
                'result'                 => strtolower($result),
                'visual_percentage'      => $vP,
                'auditory_percentage'    => $aP,
                'kinesthetic_percentage' => $kP,
            ],
        ]);
    }
}
