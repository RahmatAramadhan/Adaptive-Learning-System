<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'name',
        'grade',
        'major',
        'academic_year',
        'homeroom_teacher_id',
    ];

    public function students()
    {
        return $this->hasMany(User::class, 'class_id');
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(User::class, 'homeroom_teacher_id');
    }
}