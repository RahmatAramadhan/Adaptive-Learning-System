<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bmw_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Menyimpan jawaban 5 pertanyaan terbuka dalam bentuk JSON
            $table->json('open_answers')->nullable(); 
            
            // Menyimpan skor dari kuesioner pilihan
            $table->integer('bekerja_score')->default(0);
            $table->integer('melanjutkan_score')->default(0);
            $table->integer('wirausaha_score')->default(0);
            
            // Menyimpan hasil akhir yang paling dominan
            $table->string('dominant_result'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bmw_mappings');
    }
};