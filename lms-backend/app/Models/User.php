<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'learning_style_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relasi ke hasil kuesioner gaya belajar
    public function learningStyle()
    {
        return $this->hasOne(LearningStyles::class, 'user_id');
    }
}
