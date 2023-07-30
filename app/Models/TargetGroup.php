<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TargetGroup extends Model
{
    protected $guarded = ['id'];

    use HasFactory;

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_target_groups');
    }
}
