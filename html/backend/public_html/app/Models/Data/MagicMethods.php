<?php

namespace App\Models\Data;

trait MagicMethods
{
    public function findOneBy($field, $value)
    {
        return $this->where(function ($query) use ($field, $value) {
            $query->where($field, '=', $value);
        })->first();
    }
}
