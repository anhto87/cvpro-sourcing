<?php

use Modules\Jobs\Http\Controllers\JobsController;

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
Route::group(['prefix' => 'jobs'], function() {
    Route::post('/{job_id}', [JobsController::class, 'detail']);
    Route::get('/query', [JobsController::class, 'query']);
    Route::get('/cvpro.top', [JobsController::class, 'queryCVProTop']);
});
