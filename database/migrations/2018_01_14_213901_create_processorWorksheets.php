<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProcessorWorksheets extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('processorWorksheets', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('loan_id')->references('id')->on('loans')->onDelete('cascade');
            $table->boolean('title_work_req')->default(false);
            $table->boolean('title_work_rcvd')->default(false);
            $table->boolean('title_work_na')->default(false);
            $table->boolean('survey_req')->default(false);
            $table->boolean('survey_ord')->default(false);
            $table->date('survey_ord_due_date')->nullable();
            $table->boolean('survey_rcvd')->default(false);
            $table->boolean('survey_expense')->default(false);
            $table->boolean('haz_ins_quote_req')->default(false);
            $table->boolean('haz_ins_quote_rcvd')->default(false);
            $table->boolean('haz_ins_quote_sent')->default(false);
            $table->boolean('haz_ins_quote_na')->default(false);
            $table->boolean('haz_ins_binder_req')->default(false);
            $table->boolean('haz_ins_binder_rcvd')->default(false);
            $table->date('haz_ins_binder_date')->nullable();
            $table->boolean('appraisal_ord')->default(false);
            $table->date('appraisal_due_date')->nullable();
            $table->boolean('appraisal_paid')->default(false);
            $table->boolean('appraisal_rcvd')->default(false);
            $table->integer('appraisal_value')->nullable();
            $table->boolean('appraisal_status')->default(false);
            $table->boolean('appraisal_disclosed')->default(false);
            $table->boolean('final_na')->default(false);
            $table->boolean('final_ord')->default(false);
            $table->date('final_due_date')->nullable();
            $table->boolean('final_paid')->default(false);
            $table->boolean('final_rcvd')->default(false);
            $table->boolean('voe_curr_emp_na')->default(false);
            $table->boolean('voe_prev_emp_na')->default(false);
            $table->boolean('fraudguard_run')->default(false);
            $table->boolean('fraudguard_cleared')->default(false);
            $table->boolean('fha_case_num_ord')->default(false);
            $table->boolean('fha_case_num_val')->default(false);
            $table->boolean('fha_case_num_trans')->default(false);
            $table->boolean('usps')->default(false);
            $table->boolean('nmls')->default(false);
            $table->boolean('flood_cert_in_zone')->default(false);
            $table->boolean('flood_cert_out_zone')->default(false);
            $table->boolean('coe_trans_req')->default(false);
            $table->boolean('coe_trans_rcvd')->default(false);
            $table->boolean('nov_req')->default(false);
            $table->boolean('nov_rcvd')->default(false);
            $table->boolean('tx_cash_req')->default(false);
            $table->boolean('tx_cash_rcvd')->default(false);
            $table->boolean('mort_payoff_req')->default(false);
            $table->boolean('mort_payoff_rcvd')->default(false);
            $table->boolean('reo_num_props')->default(false);
            $table->boolean('res_income_comp')->default(false);
            $table->boolean('res_income_na')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('processorWorksheets');
    }
}
