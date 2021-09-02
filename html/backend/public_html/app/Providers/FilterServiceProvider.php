<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\FilterQueryBuilder;

class FilterServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(\App\Services\FilterQueryBuilder::class, function () {
            $request = app(\Illuminate\Http\Request::class);

            return new FilterQueryBuilder($request);
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
