<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = [
        'name'
    ];

    public function employees()
    {
        return $this->belongsTo(Employee::class, 'position_id');
    }
}
