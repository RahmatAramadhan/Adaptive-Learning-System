<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['evaluation_id', 'text', 'options', 'correct_option_index'];

    protected $casts = [
        'options' => 'array',
    ];
}
