<?php

namespace Modules\Privileges\Models\Observer;
use Spatie\Permission\Models\Permission;

class PermissionObserver
{
    /**
     * Handle the "saving" event.
     *
     * @param  \Spatie\Permission\Models\Permission  $permission
     * @return void
     */
    public function saving(Permission $permission)
    {
        $websiteId = app('tenant')->getWebsiteId();
        $permission->website_id = $websiteId;
    }
}
