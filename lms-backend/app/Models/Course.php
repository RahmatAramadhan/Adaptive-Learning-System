<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['title', 'description', 'thumbnail', 'created_by'];

    public function modules()
    {
        return $this->hasMany(CourseModule::class);
    }
}
