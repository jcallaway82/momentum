<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditUserFieldsForLoansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn('loan_officer');
            $table->dropColumn('loan_processor');
            $table->string('tm_loan_officer')->after('milestone');
            $table->string('tm_lo_assistant')->nullable()->after('tm_loan_officer');
            $table->string('tm_setup')->nullable()->after('tm_lo_assistant');
            $table->string('tm_loan_processor')->nullable()->after('tm_setup');
            $table->string('tm_underwriter')->nullable()->after('tm_loan_processor');
            $table->string('tm_closer')->nullable()->after('tm_underwriter');
            $table->string('tm_funder')->nullable()->after('tm_closer');
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
            $table->string('loan_officer');
            $table->string('loan_processor')->nullable();
            $table->dropColumn('tm_loan_officer');
            $table->dropColumn('tm_lo_assistant');
            $table->dropColumn('tm_setup');
            $table->dropColumn('tm_loan_processor');
            $table->dropColumn('tm_underwriter');
            $table->dropColumn('tm_closer');
            $table->dropColumn('tm_funder');
        });
    }
}
