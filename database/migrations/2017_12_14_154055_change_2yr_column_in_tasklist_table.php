<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Change2yrColumnInTasklistTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('taskLists', function (Blueprint $table) {
            $table->renameColumn('2yr_emp_hist_req', 'two_yr_emp_hist_req');
            $table->renameColumn('2yr_emp_hist_rcvd', 'two_yr_emp_hist_rcvd');
            $table->renameColumn('2yr_emp_hist_na', 'two_yr_emp_hist_na');
            $table->renameColumn('2yr_emp_hist_notes', 'two_yr_emp_hist_notes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('taskLists', function (Blueprint $table) {
            $table->renameColumn('two_yr_emp_hist_req', '2yr_emp_hist_req');
            $table->renameColumn('two_yr_emp_hist_rcvd', '2yr_emp_hist_rcvd');
            $table->renameColumn('two_yr_emp_hist_na', '2yr_emp_hist_na');
            $table->renameColumn('two_yr_emp_hist_notes', '2yr_emp_hist_notes');
        });
    }
}
