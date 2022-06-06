<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLoansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->increments('id')->unique();
            $table->integer('loan_id')->unique();
            $table->string('borrower_name');
            $table->string('loan_type');
            $table->string('loan_purpose');
            $table->string('milestone');
            $table->string('loan_officer');
            $table->string('loan_processor')->nullable();
            $table->string('lock_status');
            $table->date('cd_sent_date')->nullable();
            $table->date('cd_received_date')->nullable();
            $table->date('application_date');
            $table->date('qualification_date')->nullable();
            $table->date('setup_date')->nullable();
            $table->date('processing_date')->nullable();
            $table->date('initial_uw_date')->nullable();
            $table->date('le_locked_resub_date')->nullable();
            $table->date('cd_closing_date')->nullable();
            $table->date('docs_out_date')->nullable();
            $table->date('actual_closing_date')->nullable();
            $table->date('scheduled_closing_date');
            $table->string('subject_property_address');
            $table->double('loan_amount');
            $table->string('new_import')->default('Y');
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
        Schema::dropIfExists('loans');
    }
}
