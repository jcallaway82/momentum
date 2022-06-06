<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateReos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reos', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('processorWorksheet_id')->references('id')->on('processorWorksheets')->onDelete('cascade');
            $table->string('property')->nullable();
            $table->string('status')->nullable();
            $table->boolean('deed')->default(false);
            $table->boolean('mortgage_stmnt')->default(false);
            $table->boolean('taxes')->default(false);
            $table->boolean('insurance')->default(false);
            $table->boolean('lease')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reos');
    }
}
