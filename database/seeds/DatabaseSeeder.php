<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('roles')->insert([
            'id' => (1),
            'name' => ('Admin'),
            'guard_name' => ('web'),
        ]);

        DB::table('roles')->insert([
            'id' => (2),
            'name' => ('User'),
            'guard_name' => ('web'),
        ]);

        DB::table('roles')->insert([
            'id' => (3),
            'name' => ('Superuser'),
            'guard_name' => ('web'),
        ]);

        DB::table('roles')->insert([
            'id' => (4),
            'name' => ('Manager'),
            'guard_name' => ('web'),
        ]);

        DB::table('permissions')->insert([
            'id' => (1),
            'name' => ('Administer Roles & Permissions'),
            'guard_name' => ('web'),
        ]);

        DB::table('permissions')->insert([
            'id' => (2),
            'name' => ('Import Encompass Pipeline'),
            'guard_name' => ('web'),
        ]);

        DB::table('permissions')->insert([
            'id' => (3),
            'name' => ('Edit Profile'),
            'guard_name' => ('web'),
        ]);

        DB::table('permissions')->insert([
            'id' => (4),
            'name' => ('Edit Pipeline'),
            'guard_name' => ('web'),
        ]);

        DB::table('permissions')->insert([
            'id' => (5),
            'name' => ('Edit Loan Detail'),
            'guard_name' => ('web'),
        ]);

        DB::table('permissions')->insert([
            'id' => (6),
            'name' => ('Clear Record Locks'),
            'guard_name' => ('web'),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (1),
            'role_id' => (1),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (2),
            'role_id' => (1),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (3),
            'role_id' => (1),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (4),
            'role_id' => (1),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (5),
            'role_id' => (1),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (6),
            'role_id' => (1),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (3),
            'role_id' => (2),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (4),
            'role_id' => (2),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (5),
            'role_id' => (2),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (2),
            'role_id' => (3),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (3),
            'role_id' => (3),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (4),
            'role_id' => (3),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (5),
            'role_id' => (3),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (6),
            'role_id' => (3),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (2),
            'role_id' => (4),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (3),
            'role_id' => (4),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (4),
            'role_id' => (4),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (5),
            'role_id' => (4),
        ]);

        DB::table('role_has_permissions')->insert([
            'permission_id' => (6),
            'role_id' => (4),
        ]);

        DB::table('users')->insert([
            'id' => (1),
            'name' => ('John Callaway'),
            'email' => ('nolbishop82@gmail.com'),
            'password' => ('$2a$12$gBozfKJuFjhe6qfqv9Qn5uzRmUHWglI71gSVy8lhZapDWGdkPv68K'),
        ]);

        DB::table('users')->insert([
            'id' => (2),
            'name' => ('Michelle Noble'),
            'email' => ('mnoble@goldfinancial.com'),
            'password' => ('$2a$12$9tiBlf8WffOIffRNhR3HEuvqOlHsvue0Jz5V3AN4UU8z/2llQ5EtW'),
        ]);

        DB::table('users')->insert([
            'id' => (3),
            'name' => ('Kathleen Callaway'),
            'email' => ('kscallaway88@gmail.com'),
            'password' => ('$2a$12$9tiBlf8WffOIffRNhR3HEuvqOlHsvue0Jz5V3AN4UU8z/2llQ5EtW'),
        ]);

        DB::table('users')->insert([
            'id' => (4),
            'name' => ('Guest'),
            'email' => ('guest@momentum-pipeline.com'),
            'password' => ('$2a$12$KRc5M5EwhwIlCyT3djrcQehfuf3OtAoi.XseoUBjiJyjjW28xkkIa'),
        ]);

        DB::table('model_has_roles')->insert([
            'role_id' => (1),
            'model_id' => (1),
            'model_type' => ('App\User'),
        ]);

        DB::table('model_has_roles')->insert([
            'role_id' => (4),
            'model_id' => (2),
            'model_type' => ('App\User'),
        ]);

        DB::table('model_has_roles')->insert([
            'role_id' => (4),
            'model_id' => (3),
            'model_type' => ('App\User'),
        ]);

        DB::table('model_has_roles')->insert([
            'role_id' => (4),
            'model_id' => (4),
            'model_type' => ('App\User'),
        ]);
    }
}
