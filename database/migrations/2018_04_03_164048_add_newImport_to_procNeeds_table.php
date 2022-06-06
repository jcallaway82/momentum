<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddNewImportToProcNeedsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("ALTER TABLE proc_needs MODIFY COLUMN notes VARCHAR(191) AFTER status");

        Schema::table('proc_needs', function (Blueprint $table) {
            $table->string('new_import')->after('notes')->default('Y');
            $table->string('assigned_to')->after('status')->default('Not Assigned');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("ALTER TABLE proc_needs MODIFY COLUMN notes VARCHAR(191) AFTER updated_at");

        Schema::table('proc_needs', function (Blueprint $table) {
            $table->dropColumn('new_import');
            $table->dropColumn('assigned_to');
        });
    }
}
