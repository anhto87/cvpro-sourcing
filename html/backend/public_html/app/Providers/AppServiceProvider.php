<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use Modules\Users\Models\Observer\UserWebsiteIdObserver;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Modules\Privileges\Models\Observer\RoleObserver;
use Modules\Privileges\Models\Observer\PermissionObserver;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {

    }
}
