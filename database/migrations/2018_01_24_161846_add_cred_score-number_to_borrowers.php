<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCredScoreNumberToBorrowers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('borrowers', function (Blueprint $table) {
            $table->integer('cred_report_number')->nullable();
            $table->boolean('cred_report_plan_res')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('borrowers', function (Blueprint $table) {
            $table->dropColumn('cred_report_number');
            $table->dropColumn('cred_report_plan_res');
        });
    }
}
