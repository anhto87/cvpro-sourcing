<?php

namespace Modules\Jobs\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Jobs extends Model
{
    protected string $connection = 'mongodb';
    protected string $collection = 'jobs';
    protected array  $guarded    = [];
    protected $hidden = ['__v'];
}
