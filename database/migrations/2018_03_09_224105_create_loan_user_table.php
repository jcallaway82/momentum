<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLoanUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('loan_user', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('loan_id')->unsigned();
            $table->integer('user_id')->unsigned();
            $table->boolean('visible')->default(true);

            $table->foreign('loan_id')->references('id')->on('loans')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('loan_user');
    }
}
