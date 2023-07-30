<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = ['id'];

    use HasFactory;

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function targetGroups()
    {
        return $this->belongsToMany(TargetGroup::class, 'product_target_groups');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'product_categories');
    }
}
