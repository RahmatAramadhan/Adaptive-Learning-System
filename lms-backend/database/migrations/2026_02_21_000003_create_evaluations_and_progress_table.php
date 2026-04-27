<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->unsignedBigInteger('module_id')->nullable();
            $table->string('title');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('evaluations')->cascadeOnDelete();
            $table->text('text');
            $table->json('options');
            $table->unsignedTinyInteger('correct_option_index');
            $table->timestamps();
        });

        Schema::create('student_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('evaluation_id')->constrained('evaluations')->cascadeOnDelete();
            $table->json('answers')->nullable();
            $table->decimal('score', 5, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('student_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('module_id');
            $table->boolean('completed')->default(false);
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id', 'module_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_progress');
        Schema::dropIfExists('student_answers');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('evaluations');
    }
};
