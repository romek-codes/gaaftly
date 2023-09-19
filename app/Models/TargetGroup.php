<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * App\Models\TargetGroup
 *
 * @property int $id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string $name
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 *
 * @method static \Database\Factories\TargetGroupFactory factory($count = null, $state = [])
 * @method static Builder|TargetGroup newModelQuery()
 * @method static Builder|TargetGroup newQuery()
 * @method static Builder|TargetGroup query()
 * @method static Builder|TargetGroup whereCreatedAt($value)
 * @method static Builder|TargetGroup whereId($value)
 * @method static Builder|TargetGroup whereName($value)
 * @method static Builder|TargetGroup whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class TargetGroup extends Model
{
    protected $guarded = ['id'];

    use HasFactory;

    /**
     * @return BelongsToMany<Product>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_target_groups');
    }
}
