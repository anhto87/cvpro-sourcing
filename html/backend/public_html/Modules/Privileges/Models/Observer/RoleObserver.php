<?php

namespace Modules\Privileges\Models\Observer;
use Spatie\Permission\Models\Role;

/**
 * Class RoleObserver
 * @package Modules\Privileges\Models\Observer
 */
class RoleObserver
{
    /**
     * Handle the "saving" event.
     *
     * @param  \Spatie\Permission\Models\Role  $role
     * @return void
     */
    public function saving(Role $role)
    {
        $websiteId = app('tenant')->getWebsiteId();
        $role->website_id = $websiteId;
    }
}
