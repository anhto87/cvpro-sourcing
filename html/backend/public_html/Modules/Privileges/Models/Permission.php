<?php

namespace Modules\Privileges\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;
use Modules\CoreConfig\Models\Scopes\IncludeByWebsiteIdScope;
class Permission extends SpatiePermission
{
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new IncludeByWebsiteIdScope);
    }
}
