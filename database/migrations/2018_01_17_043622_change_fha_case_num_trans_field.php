<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeFhaCaseNumTransField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('processorWorksheets', function (Blueprint $table) {
            $table->string('fha_case_num_trans')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('processorWorksheets', function (Blueprint $table) {
            $table->boolean('fha_case_num_trans')->default(false)->change();
        });
    }
}
