<?php

namespace Modules\Privileges\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Modules\CoreConfig\Models\Scopes\IncludeByWebsiteIdScope;
class Role extends SpatieRole
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
