<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeClosingDiscFieldNames extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('officerWorksheets', function (Blueprint $table) {
            $table->renameColumn('closing_disc_rcvd', 'closing_disc_sent');
            $table->renameColumn('closing_disc_na', 'closing_disc_signed');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('officerWorksheets', function (Blueprint $table) {
            $table->renameColumn('closing_disc_sent', 'closing_disc_rcvd');
            $table->renameColumn('closing_disc_signed', 'closing_disc_na');
        });
    }
}
