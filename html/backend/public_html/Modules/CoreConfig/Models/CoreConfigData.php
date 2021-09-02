<?php

namespace Modules\CoreConfig\Models;

use Illuminate\Database\Eloquent\Model;
use Modules\CoreConfig\Models\Scopes\IncludeByScopeIdWebsite;

class CoreConfigData extends Model
{
    protected $table      = 'core_config_data';
    protected $primaryKey = 'config_id';

    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new IncludeByScopeIdWebsite);
    }
}
