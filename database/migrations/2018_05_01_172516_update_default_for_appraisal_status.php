<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateDefaultForAppraisalStatus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('processorWorksheets', function (Blueprint $table) {
            $table->string('appraisal_status')->default('none')->change();
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
            $table->string('appraisal_status')->default(0)->nullable()->change();
        });
    }
}
