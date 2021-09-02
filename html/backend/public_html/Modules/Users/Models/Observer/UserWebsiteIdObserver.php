<?php


namespace Modules\Users\Models\Observer;

use App\Models\User;

class UserWebsiteIdObserver
{
    /**
     * Handle the "saving" event.
     *
     * @param  \Spatie\Permission\Models\Permission  $permission
     * @return void
     */
    public function saving(User $user)
    {
        $websiteId = app('tenant')->getWebsiteId();
        $user->website_id = $websiteId;
    }
}
