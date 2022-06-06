<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDateTrigger extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        /*DB::unprepared('
        CREATE TRIGGER calculate_dates BEFORE INSERT ON `PipeLine` FOR EACH ROW
            BEGIN
	            SET 
	            NEW.docs_out_date = DATE_SUB(scheduled_closing_date, INTERVAL 1 DAY),
	            NEW.cd_closing_date = DATE_SUB(scheduled_closing_date, INTERVAL 3 DAY),
	            NEW.docs_out_date = DATE_SUB(scheduled_closing_date, INTERVAL 1 DAY),
	            NEW.docs_out_date = DATE_SUB(scheduled_closing_date, INTERVAL 1 DAY),
	            NEW.docs_out_date = DATE_SUB(scheduled_closing_date, INTERVAL 1 DAY),
            END
        ');*/
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        /*DB::unprepared('DROP TRIGGER `calculate_dates`');*/
    }
}
