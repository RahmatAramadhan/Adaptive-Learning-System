<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);


        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'siswa',
        ]);


        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;


        return response()->json([

            'token' =>
                $token,

            'user' =>
                $this->formatUser($user),

            'need_class_selection' =>
                $user->role === 'siswa'
                && $user->class_id === null
                && SchoolClass::count() > 0,

        ], 201);
    }





    public function login(Request $request)
    {
        $request->validate([

            'email' =>
                'required|email',

            'password' =>
                'required',

        ]);



        if (!Auth::attempt($request->only('email', 'password'))) {

            return response()->json([
                'message' =>
                    'Email atau password salah.'
            ],401);

        }



        $user  = Auth::user();

        $token =
            $user->createToken('auth_token')
            ->plainTextToken;



        return response()->json([

            'token' =>
                $token,


            'user' =>
                $this->formatUser($user),


            'need_class_selection' =>
                $user->role === 'siswa'
                && $user->class_id === null
                && SchoolClass::count() > 0,

        ]);
    }





    public function logout(Request $request)
    {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();


        return response()->json([
            'message' =>
                'Logged out.'
        ]);
    }





    public function me(Request $request)
    {
        $user = $request->user();


        return response()->json([

            'user' =>
                $this->formatUser($user),


            'need_class_selection' =>
                $user->role === 'siswa'
                && $user->class_id === null
                && SchoolClass::count() > 0,

        ]);
    }





    private function formatUser(User $user): array
    {
        $style = $user->learningStyle;


        return [

            'id' =>
                $user->id,


            'name' =>
                $user->name,


            'email' =>
                $user->email,


            'role' =>
                $user->role,


            'class' =>
                $user->class ? [

                    'id' =>
                        $user->class->id,

                    'name' =>
                        $user->class->name,

                    'grade' =>
                        $user->class->grade,

                    'major' =>
                        $user->class->major,

                ] : null,



            'has_learning_style' =>
                !is_null($style),



            'learning_style' =>
                $style ? [

                    'result' =>
                        strtolower($style->result),

                    'visual_percentage' =>
                        $style->visual_percentage,

                    'auditory_percentage' =>
                        $style->auditory_percentage,

                    'kinesthetic_percentage'=>
                        $style->kinesthetic_percentage,

                ] : null,

        ];
    }
}