<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeOtherPropsIntent extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('officerWorksheets', function (Blueprint $table) {
            $table->text('other_props_intent')->default('')->change();
            $table->text('income')->default('')->change();
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
            $table->boolean('other_props_intent')->default(false)->change();
            $table->text('income')->nullable()->change();
        });
    }
}
