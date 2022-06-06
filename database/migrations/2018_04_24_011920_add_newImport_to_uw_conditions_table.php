<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNewImportToUwConditionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('uw_condition', function (Blueprint $table) {
            $table->string('assigned_to')->after('status')->default('Not Assigned');
            $table->string('new_import')->after('assigned_to')->default('Y');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('uw_condition', function (Blueprint $table) {
            $table->dropColumn('assigned_to');
            $table->dropColumn('new_import');
        });
    }
}
