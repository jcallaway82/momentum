<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeOtherPropsIntentToNull extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('officerWorksheets', function (Blueprint $table) {
            $table->text('other_props_intent')->nullable()->change();
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
            $table->text('other_props_intent')->default('')->change();
        });
    }
}
