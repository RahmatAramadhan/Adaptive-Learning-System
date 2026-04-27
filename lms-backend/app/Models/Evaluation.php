<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    protected $fillable = ['course_id', 'module_id', 'title', 'created_by'];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
