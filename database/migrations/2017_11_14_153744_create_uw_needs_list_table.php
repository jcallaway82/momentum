<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUwNeedsListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('uw_condition', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('loan_id')->references('id')->on('loans')->onDelete('cascade');
            $table->text('name')->nullable();
            $table->text('description')->nullable();
            $table->text('prior_to')->nullable();
            $table->text('status')->nullable();
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
        Schema::dropIfExists('uw_condition');
    }
}
