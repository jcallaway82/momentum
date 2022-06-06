<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemovePropertyNumFromReosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('reos', function (Blueprint $table) {
            $table->dropColumn('property_num');
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
            $table->integer('property_num')->default(0)->after('loan_id');
        });
    }
}
