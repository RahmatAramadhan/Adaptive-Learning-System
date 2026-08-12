<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BmwMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'open_answers',
        'bekerja_score',
        'melanjutkan_score',
        'wirausaha_score',
        'dominant_result',
    ];

    protected $casts = [
        'open_answers' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}