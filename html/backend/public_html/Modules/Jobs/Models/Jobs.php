<?php

namespace Modules\Jobs\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Jobs extends Model
{
    protected  $connection = 'mongodb';
    protected  $collection = 'jobs';
    protected  $guarded    = [];
    protected $hidden = ['__v'];
}
