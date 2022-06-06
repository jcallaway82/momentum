<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBorrowers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('borrowers', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('loan_id')->references('id')->on('loans')->onDelete('cascade');
            $table->integer('borrower_num')->nullable();
            $table->integer('cred_report_score')->nullable();
            $table->boolean('driv_license_req')->default(false);
            $table->boolean('driv_license_rcvd')->default(false);
            $table->boolean('driv_license_na')->default(false);
            $table->boolean('pay_stub_req')->default(false);
            $table->boolean('pay_stub_rcvd')->default(false);
            $table->boolean('pay_stub_na')->default(false);
            $table->boolean('tax_return_req')->default(false);
            $table->boolean('tax_return_rcvd')->default(false);
            $table->boolean('tax_return_na')->default(false);
            $table->boolean('award_letter_req')->default(false);
            $table->boolean('award_letter_rcvd')->default(false);
            $table->boolean('award_letter_na')->default(false);
            $table->boolean('voe_curr_emp_req')->default(false);
            $table->boolean('voe_curr_emp_rcvd')->default(false);
            $table->boolean('voe_prev_emp_req')->default(false);
            $table->boolean('voe_prev_emp_rcvd')->default(false);
            $table->boolean('ss_val_req')->default(false);
            $table->boolean('ss_val_rcvd')->default(false);
            $table->boolean('tax_trans_ord')->default(false);
            $table->boolean('tax_trans_rcvd')->default(false);
            $table->boolean('tax_trans_na')->default(false);
            $table->boolean('w2_trans_ord')->default(false);
            $table->boolean('w2_trans_rcvd')->default(false);
            $table->boolean('w2_trans_na')->default(false);
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
        Schema::dropIfExists('borrowers');
    }
}
