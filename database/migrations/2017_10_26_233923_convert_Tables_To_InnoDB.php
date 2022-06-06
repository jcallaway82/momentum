<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ConvertTablesToInnoDB extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $tables = [
            'loans',
            'migrations',
            'model_has_permissions',
            'model_has_roles',
            'password_resets',
            'permissions',
            'recordLocks',
            'role_has_permissions',
            'roles',
            'taskLists',
            'users'
        ];
        foreach ($tables as $table) {
            DB::statement('ALTER TABLE ' . $table . ' ENGINE = InnoDB');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $tables = [
            'loans',
            'migrations',
            'model_has_permissions',
            'model_has_roles',
            'password_resets',
            'permissions',
            'recordLocks',
            'role_has_permissions',
            'roles',
            'taskLists',
            'users'
        ];
        foreach ($tables as $table) {
            DB::statement('ALTER TABLE ' . $table . ' ENGINE = null');
        }
    }
}
