<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeFinalPaid extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('processorWorksheets', function (Blueprint $table) {
            $table->renameColumn('final_paid', 'final_paid_poc');
            $table->boolean('final_paid_pac')->default(false);
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
            $table->renameColumn('final_paid_poc', 'final_paid');
            $table->dropColumn('final_paid_pac');
        });
    }
}
