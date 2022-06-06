<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTaskListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('taskLists', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('loan_id')->references('id')->on('loans')->onDelete('cascade');
            $table->boolean('init_disc_req')->default(false);
            $table->boolean('init_disc_rcvd')->default(false);
            $table->text('init_disc_notes')->nullable();
            $table->boolean('wet_sig_req')->default(false);
            $table->boolean('wet_sig_rcvd')->default(false);
            $table->text('wet_sig_notes')->nullable();
            $table->boolean('sales_contract_req')->default(false);
            $table->boolean('sales_contract_rcvd')->default(false);
            $table->text('sales_contract_notes')->nullable();
            $table->boolean('2yr_emp_hist_req')->default(false);
            $table->boolean('2yr_emp_hist_rcvd')->default(false);
            $table->boolean('2yr_emp_hist_na')->default(false);
            $table->text('2yr_emp_hist_notes')->nullable();
            $table->boolean('award_letter_req')->default(false);
            $table->boolean('award_letter_rcvd')->default(false);
            $table->boolean('award_letter_na')->default(false);
            $table->text('award_letter_notes')->nullable();
            $table->integer('cred_report_score')->nullable();
            $table->boolean('cred_report_plan_rescore')->default(false);
            $table->text('cred_report_notes')->nullable();
            $table->boolean('verb_cred_auth_rcvd')->default(false);
            $table->text('verb_cred_auth_notes')->nullable();
            $table->boolean('cred_loe_req')->default(false);
            $table->boolean('cred_loe_rcvd')->default(false);
            $table->text('cred_loe_notes')->nullable();
            $table->boolean('driv_lic_req')->default(false);
            $table->boolean('driv_lic_rcvd')->default(false);
            $table->text('driv_lic_notes')->nullable();
            $table->boolean('pay_stub_req')->default(false);
            $table->boolean('pay_stub_rcvd')->default(false);
            $table->text('pay_stub_notes')->nullable();
            $table->boolean('bank_stmnt_req')->default(false);
            $table->boolean('bank_stmnt_rcvd')->default(false);
            $table->text('bank_stmnt_notes')->nullable();
            $table->boolean('tax_rtrn_req')->default(false);
            $table->boolean('tax_rtrn_rcvd')->default(false);
            $table->text('tax_rtrn_notes')->nullable();
            $table->boolean('reo_docs_req')->default(false);
            $table->boolean('reo_docs_rcvd')->default(false);
            $table->boolean('reo_docs_na')->default(false);
            $table->text('reo_docs_notes')->nullable();
            $table->boolean('dd214_req')->default(false);
            $table->boolean('dd214_rcvd')->default(false);
            $table->boolean('dd214_na')->default(false);
            $table->text('dd214_notes')->nullable();
            $table->boolean('appraisal_ord')->default(false);
            $table->boolean('appraisal_rcvd')->default(false);
            $table->boolean('appraisal_disclosed')->default(false);
            $table->date('appraisal_due_date')->nullable();
            $table->double('appraisal_value')->nullable();
            $table->string('appraisal_status')->nullable();
            $table->text('appraisal_notes')->nullable();
            $table->boolean('title_work_req')->default(false);
            $table->boolean('title_work_rcvd')->default(false);
            $table->text('title_work_notes')->nullable();
            $table->boolean('survey_req_status')->default(false);
            $table->boolean('survey_ord')->default(false);
            $table->boolean('survey_rcvd')->default(false);
            $table->date('survey_ord_due_date')->nullable();
            $table->text('survey_notes')->nullable();
            $table->boolean('hazard_ins_quote')->default(false);
            $table->boolean('hazard_ins_bind_req')->default(false);
            $table->boolean('hazard_ins_bind_rcvd')->default(false);
            $table->text('hazard_ins_notes')->nullable();
            $table->boolean('flood_cert_ord')->default(false);
            $table->boolean('flood_cert_in_zone')->default(false);
            $table->boolean('flood_cert_out_zone')->default(false);
            $table->text('flood_cert_notes')->nullable();
            $table->boolean('usps_req')->default(false);
            $table->boolean('usps_rcvd')->default(false);
            $table->text('usps_notes')->nullable();
            $table->boolean('fha_case_num_req')->default(false);
            $table->boolean('fha_case_num_rcvd')->default(false);
            $table->boolean('fha_case_num_na')->default(false);
            $table->text('fha_case_num_notes')->nullable();
            $table->boolean('voe_curr_emp_req')->default(false);
            $table->boolean('voe_curr_emp_rcvd')->default(false);
            $table->boolean('voe_curr_emp_na')->default(false);
            $table->text('voe_curr_emp_notes')->nullable();
            $table->boolean('voe_prev_emp_req')->default(false);
            $table->boolean('voe_prev_emp_rcvd')->default(false);
            $table->boolean('voe_prev_emp_na')->default(false);
            $table->text('voe_prev_emp_notes')->nullable();
            $table->boolean('nmls_rcvd')->default(false);
            $table->text('nmls_notes')->nullable();
            $table->boolean('ss_val_req')->default(false);
            $table->boolean('ss_val_rcvd')->default(false);
            $table->text('ss_val_notes')->nullable();
            $table->boolean('tax_trans_req')->default(false);
            $table->boolean('tax_trans_rcvd')->default(false);
            $table->text('tax_trans_notes')->nullable();
            $table->boolean('w2_trans_req')->default(false);
            $table->boolean('w2_trans_rcvd')->default(false);
            $table->text('w2_trans_notes')->nullable();
            $table->boolean('coe_trans_ord')->default(false);
            $table->boolean('coe_trans_rcvd')->default(false);
            $table->boolean('coe_trans_na')->default(false);
            $table->text('coe_trans_notes')->nullable();
            $table->string('run_aus_options')->nullable();
            $table->string('run_aus_findings')->nullable();
            $table->text('run_aus_notes')->nullable();
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
        Schema::dropIfExists('taskLists');
    }
}
