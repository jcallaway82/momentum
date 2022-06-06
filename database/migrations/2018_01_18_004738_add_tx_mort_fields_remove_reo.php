<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTxMortFieldsRemoveReo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('processorWorksheets', function (Blueprint $table) {
            $table->boolean('tx_cash_na')->default(false)->after('tx_cash_rcvd');
            $table->boolean('mort_payoff_na')->default(false)->after('mort_payoff_rcvd');
            $table->boolean('final_paid_pac')->default(false)->after('final_paid_poc')->change();
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
            $table->dropColumn('tx_cash_na');
            $table->dropColumn('mort_payoff_na');
            $table->boolean('final_paid_pac')->default(false)->after('updated_at')->change();
        });
    }
}
