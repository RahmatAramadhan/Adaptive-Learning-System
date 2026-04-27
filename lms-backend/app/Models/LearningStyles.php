<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningStyles extends Model
{
    protected $table = 'learning_styles';
    protected $fillable = [
        'user_id',
        'result',
        'visual_percentage',
        'auditory_percentage',
        'kinesthetic_percentage',
    ];
}
