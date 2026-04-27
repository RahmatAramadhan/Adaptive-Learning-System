<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseModule extends Model
{
    protected $table    = 'course_modules';
    protected $fillable = ['course_id', 'title', 'description', 'content'];

    protected $casts = [
        'content' => 'array',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
