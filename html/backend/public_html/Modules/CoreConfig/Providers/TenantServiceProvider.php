<?php

namespace Modules\CoreConfig\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\CoreConfig\Repositories\CoreConfigRepository;
use Modules\CoreConfig\Repositories\WebsitesRepository;
use Modules\CoreConfig\Services\TenantService;

class TenantServiceProvider extends ServiceProvider
{
    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {

    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function boot()
    {
        $this->app->singleton('tenant', function ($app) {
            return new TenantService(new WebsitesRepository, new CoreConfigRepository);
        });
    }
}
