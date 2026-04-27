<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProgress extends Model
{
    protected $table    = 'student_progress';
    protected $fillable = ['user_id', 'course_id', 'module_id', 'completed', 'score', 'time_spent'];

    protected $casts = [
        'completed' => 'boolean',
    ];
}
