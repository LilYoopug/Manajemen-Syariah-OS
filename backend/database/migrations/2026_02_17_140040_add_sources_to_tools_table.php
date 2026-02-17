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
        Schema::table('tools', function (Blueprint $table) {
            $table->json('sources')->nullable()->after('related_directory_ids');
        });

        // Migrate existing data
        DB::statement("
            UPDATE tools
            SET sources = JSON_ARRAY(
                JSON_OBJECT(
                    'type', 'website',
                    'title', COALESCE(related_dalil_source, ''),
                    'url', ''
                )
            )
            WHERE related_dalil_text IS NOT NULL AND related_dalil_text != ''
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropColumn('sources');
        });
    }
};
