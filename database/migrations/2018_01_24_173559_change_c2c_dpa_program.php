<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeC2cDpaProgram extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('officerWorksheets', function (Blueprint $table) {
            $table->string('c2c_dpa_program')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('officerWorksheets', function (Blueprint $table) {
            $table->boolean('c2c_dpa_program')->default(false)->change();
        });
    }
}
