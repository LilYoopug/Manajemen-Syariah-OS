<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->text('description');
            $table->json('inputs')->nullable();
            $table->json('outputs')->nullable();
            $table->json('benefits')->nullable();
            $table->text('sharia_basis')->nullable();
            $table->string('link')->nullable();
            $table->json('related_directory_ids')->nullable();
            $table->text('related_dalil_text')->nullable();
            $table->string('related_dalil_source')->nullable();
            $table->timestamps();

            $table->index(['category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
