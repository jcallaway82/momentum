<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOfficerWorksheets extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('officerWorksheets', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('loan_id')->references('id')->on('loans')->onDelete('cascade');
            $table->boolean('prop_type_prim_res')->default(false);
            $table->boolean('prop_type_invest_res')->default(false);
            $table->boolean('prop_type_sec_home')->default(false);
            $table->boolean('prop_type_detached')->default(false);
            $table->boolean('prop_type_manufactured')->default(false);
            $table->boolean('prop_type_condo')->default(false);
            $table->boolean('prop_type_townhome')->default(false);
            $table->boolean('sales_contract_req')->default(false);
            $table->boolean('sales_contract_rcvd')->default(false);
            $table->boolean('sales_contract_na')->default(false);
            $table->boolean('wet_sig_req')->default(false);
            $table->boolean('wet_sig_rcvd')->default(false);
            $table->boolean('wet_sig_na')->default(false);
            $table->boolean('init_disc_req')->default(false);
            $table->boolean('init_disc_rcvd')->default(false);
            $table->boolean('init_disc_na')->default(false);
            $table->boolean('cred_report_number')->default(false);
            $table->boolean('cred_report_plan_res')->default(false);
            $table->boolean('bankruptcy_hist')->default(false);
            $table->boolean('verb_cred_auth')->default(false);
            $table->boolean('foreclosure_hist')->default(false);
            $table->boolean('cred_loe_req')->default(false);
            $table->boolean('cred_loe_rcvd')->default(false);
            $table->boolean('cred_loe_na')->default(false);
            $table->boolean('child_sup_req')->default(false);
            $table->boolean('child_sup_rcvd')->default(false);
            $table->boolean('child_sup_na')->default(false);
            $table->boolean('divorce_decree_req')->default(false);
            $table->boolean('divorce_decree_rcvd')->default(false);
            $table->boolean('divorce_decree_na')->default(false);
            $table->boolean('other_props')->default(false);
            $table->boolean('other_props_intent')->default(false);
            $table->boolean('two_yr_emp_hist_req')->default(false);
            $table->boolean('two_yr_emp_hist_rcvd')->default(false);
            $table->boolean('two_yr_emp_hist_na')->default(false);
            $table->boolean('income')->default(false);
            $table->boolean('c2c_check')->default(false);
            $table->boolean('c2c_check_stmnt_req')->default(false);
            $table->boolean('c2c_check_stmnt_rcvd')->default(false);
            $table->boolean('c2c_check_stmnt_na')->default(false);
            $table->boolean('c2c_gift')->default(false);
            $table->boolean('c2c_gift_equity')->default(false);
            $table->boolean('c2c_gift_letter_req')->default(false);
            $table->boolean('c2c_gift_letter_rcvd')->default(false);
            $table->boolean('c2c_gift_letter_na')->default(false);
            $table->boolean('c2c_gift_check_req')->default(false);
            $table->boolean('c2c_gift_check_rcvd')->default(false);
            $table->boolean('c2c_gift_check_na')->default(false);
            $table->boolean('c2c_gift_donor_req')->default(false);
            $table->boolean('c2c_gift_donor_rcvd')->default(false);
            $table->boolean('c2c_gift_donor_na')->default(false);
            $table->boolean('c2c_gift_borrower_req')->default(false);
            $table->boolean('c2c_gift_borrower_rcvd')->default(false);
            $table->boolean('c2c_gift_borrower_na')->default(false);
            $table->boolean('c2c_dpa')->default(false);
            $table->boolean('c2c_dpa_program')->default(false);
            $table->boolean('c2c_dpa_pack_sent')->default(false);
            $table->boolean('c2c_2nd_lien')->default(false);
            $table->string('c2c_2nd_lien_details')->nullable();
            $table->boolean('locked_le_req')->default(false);
            $table->boolean('locked_le_rcvd')->default(false);
            $table->boolean('locked_le_na')->default(false);
            $table->boolean('closing_disc_req')->default(false);
            $table->boolean('closing_disc_rcvd')->default(false);
            $table->boolean('closing_disc_na')->default(false);
            $table->string('run_aus_options')->nullable();
            $table->string('run_aus_findings')->nullable();
            $table->boolean('dd214_req')->default(false);
            $table->boolean('dd214_rcvd')->default(false);
            $table->boolean('nps_req')->default(false);
            $table->boolean('nps_rcvd')->default(false);
            $table->boolean('nps_na')->default(false);
            $table->boolean('debts')->default(false);
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
        Schema::dropIfExists('officerWorksheets');
    }
}
