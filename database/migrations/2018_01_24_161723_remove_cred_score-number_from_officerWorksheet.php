<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveCredScoreNumberFromOfficerWorksheet extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('officerWorksheets', function (Blueprint $table) {
            $table->dropColumn('cred_report_number');
            $table->dropColumn('cred_report_plan_res');
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
            $table->boolean('cred_report_number')->default(false);
            $table->boolean('cred_report_plan_res')->default(false);
        });
    }
}
