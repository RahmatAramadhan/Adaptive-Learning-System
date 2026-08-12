<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bmw_mappings', function (Blueprint $table) {
 
            $table->json('closed_answers')->nullable()->after('open_answers');
        });
    }

    public function down(): void
    {
        Schema::table('bmw_mappings', function (Blueprint $table) {
  
            $table->dropColumn('closed_answers');
        });
    }
};