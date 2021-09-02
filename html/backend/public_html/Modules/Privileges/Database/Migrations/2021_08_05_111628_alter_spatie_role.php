<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterSpatieRole extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->integer('website_id')->after('id');
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->integer('website_id')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('website_id');
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('website_id');
        });
    }
}
