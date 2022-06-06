<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeProcessorWorksheetIdToLoanId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('reos', function (Blueprint $table) {
            $table->integer('processorWorksheet_id')->references('id')->on('loans')->onDelete('cascade')->change();
            $table->renameColumn('processorWorksheet_id', 'loan_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('reos', function (Blueprint $table) {
            $table->integer('loan_id')->references('id')
                ->on('processorWorksheets')->onDelete('cascade')->change();
            $table->renameColumn('loan_id', 'processorWorksheet_id');
        });
    }
}
