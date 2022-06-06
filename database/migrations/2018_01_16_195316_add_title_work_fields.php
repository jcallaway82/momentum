<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTitleWorkFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('processorWorksheets', function (Blueprint $table) {
            $table->boolean('title_work_rcvd_comm')->default(false)->after('title_work_rcvd');
            $table->boolean('title_work_rcvd_cpl')->default(false)->after('title_work_rcvd_comm');
            $table->boolean('title_work_rcvd_title')->default(false)->after('title_work_rcvd_cpl');
            $table->boolean('title_work_rcvd_tax')->default(false)->after('title_work_rcvd_title');
            $table->boolean('title_work_rcvd_eo')->default(false)->after('title_work_rcvd_tax');
            $table->boolean('title_work_rcvd_wiring')->default(false)->after('title_work_rcvd_eo');
            $table->boolean('title_work_rcvd_prelim')->default(false)->after('title_work_rcvd_wiring');
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
            $table->dropColumn('title_work_rcvd_comm');
            $table->dropColumn('title_work_rcvd_cpl');
            $table->dropColumn('title_work_rcvd_title');
            $table->dropColumn('title_work_rcvd_tax');
            $table->dropColumn('title_work_rcvd_eo');
            $table->dropColumn('title_work_rcvd_wiring');
            $table->dropColumn('title_work_rcvd_prelim');
        });
    }
}
