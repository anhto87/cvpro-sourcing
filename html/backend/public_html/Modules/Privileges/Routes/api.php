<?php

use Modules\Privileges\Http\Controllers\RolesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// ZONE FOR ADMINISTRATOR
Route::group(['prefix' => 'privileges', 'middleware' => ['api', 'jwt.verify']], function() {
    Route::group(['prefix' => 'roles'], function() {
        Route::put('/', [RolesController::class, 'add']);// new role
        Route::put('/permissions', [RolesController::class, 'assignPermission']); // add permission to role
        Route::put('/users', [RolesController::class, 'assignUser']); // add user to role
        Route::post('/users', [RolesController::class, 'updateRoleUser']); // update role of user
        Route::get('/users/{roleId}', [RolesController::class, 'getUsers']); // get list user by role
        Route::get('/all', [RolesController::class, 'all']); // return all roles and permissions belong
    });
});
