<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventDeleteRecordLocks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('
        CREATE EVENT e_delete_record_locks 
        ON SCHEDULE EVERY 5 SECOND
        ON COMPLETION PRESERVE
        
        DO
            DELETE FROM recordLocks WHERE lockDateTime < DATE_SUB(NOW(), INTERVAL 20 SECOND);    
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::unprepared('DROP EVENT `e_delete_record_locks`');
    }
}
