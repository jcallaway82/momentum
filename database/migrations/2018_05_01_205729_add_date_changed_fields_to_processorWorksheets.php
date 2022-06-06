<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDateChangedFieldsToProcessorWorksheets extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('processorWorksheets', function (Blueprint $table) {
            $table->date('appraisal_ord_date')->after('appraisal_ord')->nullable();
            $table->date('survey_ord_date')->after('survey_ord')->nullable();
            $table->date('title_work_req_date')->after('title_work_req')->nullable();
            $table->date('haz_ins_quote_req_date')->after('haz_ins_quote_req')->nullable();
            $table->date('haz_ins_quote_sent_date')->after('haz_ins_quote_sent')->nullable();
            $table->date('haz_ins_binder_req_date')->after('haz_ins_binder_req')->nullable();
            $table->date('final_ord_date')->after('final_ord')->nullable();
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
            $table->dropColumn('appraisal_ord_date');
            $table->dropColumn('survey_ord_date');
            $table->dropColumn('title_work_req_date');
            $table->dropColumn('haz_ins_quote_req_date');
            $table->dropColumn('haz_ins_quote_sent_date');
            $table->dropColumn('haz_ins_binder_req_date');
            $table->dropColumn('final_ord_date');
        });
    }
}
