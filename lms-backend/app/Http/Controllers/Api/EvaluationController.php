<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\StudentAnswer;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function index()
    {
        return response()->json(Evaluation::with('questions')->get());
    }

    public function indexByModule($courseId, $moduleId)
    {
        $evaluations = Evaluation::where('course_id', $courseId)
            ->where('module_id', $moduleId)
            ->with('questions')
            ->get();
        
        return response()->json($evaluations);
    }

    public function show($id)
    {
        return response()->json(Evaluation::with('questions')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title'     => 'required|string',
            'questions' => 'required|array|min:1',
        ]);

        $evaluation = Evaluation::create([
            'course_id'  => $request->course_id,
            'module_id'  => $request->module_id,
            'title'      => $request->title,
            'created_by' => $request->user()->id,
        ]);

        foreach ($request->questions as $q) {
            $evaluation->questions()->create([
                'text'                => $q['text'],
                'options'             => json_encode($q['options']),
                'correct_option_index'=> $q['correctOptionIndex'],
            ]);
        }

        return response()->json($evaluation->load('questions'), 201);
    }

    public function update(Request $request, $id)
    {
        $evaluation = Evaluation::findOrFail($id);
        $evaluation->update($request->only(['title', 'course_id', 'module_id']));

        if ($request->has('questions')) {
            $evaluation->questions()->delete();
            foreach ($request->questions as $q) {
                $evaluation->questions()->create([
                    'text'                 => $q['text'],
                    'options'              => json_encode($q['options']),
                    'correct_option_index' => $q['correctOptionIndex'],
                ]);
            }
        }

        return response()->json($evaluation->load('questions'));
    }

    public function destroy($id)
    {
        $evaluation = Evaluation::findOrFail($id);
        $evaluation->questions()->delete();
        $evaluation->delete();
        return response()->json(['message' => 'Evaluation deleted.']);
    }

    public function submitAnswer(Request $request, $id)
    {
        $request->validate(['answers' => 'required|array']);

        $evaluation = Evaluation::with('questions')->findOrFail($id);
        $correct    = 0;
        $total      = $evaluation->questions->count();

        foreach ($evaluation->questions as $question) {
            $userAnswer = $request->answers[$question->id] ?? null;
            if ((int) $userAnswer === (int) $question->correct_option_index) {
                $correct++;
            }
        }

        $score = $total > 0 ? round(($correct / $total) * 100) : 0;

        StudentAnswer::updateOrCreate(
            ['user_id' => $request->user()->id, 'evaluation_id' => $id],
            ['answers' => json_encode($request->answers), 'score' => $score]
        );

        return response()->json([
            'score'       => $score,
            'correct'     => $correct,
            'total'       => $total,
        ]);
    }

    public function getStudentResults($id)
    {
        $evaluation = Evaluation::with('questions')->findOrFail($id);
        $answers = StudentAnswer::where('evaluation_id', $id)
            ->with('user')
            ->get();

        $results = $answers->map(function($answer) use ($evaluation) {
            $correct = 0;
            $total = $evaluation->questions->count();
            
            foreach ($evaluation->questions as $question) {
                $userAnswer = $answer->answers[$question->id] ?? null;
                if ((int) $userAnswer === (int) $question->correct_option_index) {
                    $correct++;
                }
            }
            
            return [
                'userId'      => $answer->user_id,
                'userName'    => $answer->user->name,
                'email'       => $answer->user->email,
                'score'       => $answer->score,
                'correct'     => $correct,
                'total'       => $total,
                'submitted_at'=> $answer->created_at,
            ];
        });

        return response()->json($results);
    }

    public function myResults(Request $request)
    {
        $userId = $request->user()->id;
        $evaluations = Evaluation::with('questions')->get();

        $results = $evaluations->map(function($evaluation) use ($userId) {
            $answer = StudentAnswer::where('user_id', $userId)
                ->where('evaluation_id', $evaluation->id)
                ->first();

            if (!$answer) {
                return null;
            }

            $correct = 0;
            $total = $evaluation->questions->count();
            
            foreach ($evaluation->questions as $question) {
                $userAnswer = $answer->answers[$question->id] ?? null;
                if ((int) $userAnswer === (int) $question->correct_option_index) {
                    $correct++;
                }
            }

            return [
                'evaluationId'    => $evaluation->id,
                'evaluationTitle' => $evaluation->title,
                'score'           => $answer->score,
                'correct'         => $correct,
                'total'           => $total,
                'submittedAt'     => $answer->created_at,
            ];
        })->filter();

        return response()->json($results->values());
    }
}
