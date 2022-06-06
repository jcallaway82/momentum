<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNewLoanFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->integer('loan_term')->after('loan_type')->nullable();
            $table->decimal('note_rate', 5, 3)->after('loan_term')->nullable();
            $table->string('subject_property_city')->after('subject_property_address')->nullable();
            $table->string('subject_property_state')->after('subject_property_city')->nullable();
            $table->string('subject_property_zip')->after('subject_property_state')->nullable();
            $table->string('subject_property_county')->after('subject_property_zip')->nullable();
            $table->string('subject_property_purchase_price')->after('subject_property_county')->nullable();
            $table->string('borr_first_name')->after('loan_amount')->nullable();
            $table->string('borr_last_name')->after('borr_first_name')->nullable();
            $table->string('borr_email')->after('borr_last_name')->nullable();
            $table->string('borr_home_phone')->after('borr_email')->nullable();
            $table->string('borr_cell')->after('borr_home_phone')->nullable();
            $table->string('coBorr_first_name')->after('borr_cell')->nullable();
            $table->string('coBorr_last_name')->after('coBorr_first_name')->nullable();
            $table->string('coBorr_email')->after('coBorr_last_name')->nullable();
            $table->string('coBorr_home_phone')->after('coBorr_email')->nullable();
            $table->string('coBorr_cell')->after('coBorr_home_phone')->nullable();
            $table->string('buyers_agent_name')->after('coBorr_cell')->nullable();
            $table->string('buyers_agent_contact_name')->after('buyers_agent_name')->nullable();
            $table->string('buyers_agent_email')->after('buyers_agent_contact_name')->nullable();
            $table->string('buyers_agent_phone')->after('buyers_agent_email')->nullable();
            $table->string('sellers_agent_name')->after('buyers_agent_phone')->nullable();
            $table->string('sellers_agent_contact_name')->after('sellers_agent_name')->nullable();
            $table->string('sellers_agent_email')->after('sellers_agent_contact_name')->nullable();
            $table->string('sellers_agent_phone')->after('sellers_agent_email')->nullable();
            $table->string('title_co_name')->after('sellers_agent_phone')->nullable();
            $table->string('title_co_contact')->after('title_co_name')->nullable();
            $table->string('title_co_phone')->after('title_co_contact')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn('loan_term');
            $table->dropColumn('note_rate');
            $table->dropColumn('subject_property_city');
            $table->dropColumn('subject_property_state');
            $table->dropColumn('subject_property_zip');
            $table->dropColumn('subject_property_county');
            $table->dropColumn('subject_property_purchase_price');
            $table->dropColumn('borr_first_name');
            $table->dropColumn('borr_last_name');
            $table->dropColumn('borr_email');
            $table->dropColumn('borr_home_phone');
            $table->dropColumn('borr_cell');
            $table->dropColumn('coBorr_first_name');
            $table->dropColumn('coBorr_last_name');
            $table->dropColumn('coBorr_email');
            $table->dropColumn('coBorr_home_phone');
            $table->dropColumn('coBorr_cell');
            $table->dropColumn('buyers_agent_name');
            $table->dropColumn('buyers_agent_contact_name');
            $table->dropColumn('buyers_agent_email');
            $table->dropColumn('buyers_agent_phone');
            $table->dropColumn('sellers_agent_name');
            $table->dropColumn('sellers_agent_contact_name');
            $table->dropColumn('sellers_agent_email');
            $table->dropColumn('sellers_agent_phone');
            $table->dropColumn('title_co_name');
            $table->dropColumn('title_co_contact');
            $table->dropColumn('title_co_phone');
        });
    }
}
