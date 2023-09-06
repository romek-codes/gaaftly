<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\TargetGroup
 *
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @method static \Database\Factories\TargetGroupFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|TargetGroup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TargetGroup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TargetGroup query()
 * @method static \Illuminate\Database\Eloquent\Builder|TargetGroup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TargetGroup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TargetGroup whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TargetGroup whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class TargetGroup extends Model
{
    protected $guarded = ['id'];

    use HasFactory;

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_target_groups');
    }
}
