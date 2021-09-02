<?php

namespace Modules\CoreConfig\Models\Scopes;

use Illuminate\Database\Eloquent\Scope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class IncludeByScopeIdWebsite implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param \Illuminate\Database\Eloquent\Builder $builder
     * @param \Illuminate\Database\Eloquent\Model   $model
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        $websiteId = app()->make('tenant')->getWebsiteId();
        $builder->where(function ($query) use ($websiteId) {
            $query->where('scope', '=', 'website');
            $query->where('scope_id', '=', $websiteId);
        });
    }
}
