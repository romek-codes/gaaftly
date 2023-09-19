<?php

namespace App\Models;

use Database\Factories\ProductImageFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * App\Models\ProductImage
 *
 * @property int $id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string $product_image_url
 * @property int $product_id
 * @property-read Product $product
 *
 * @method static ProductImageFactory factory($count = null, $state = [])
 * @method static Builder|ProductImage newModelQuery()
 * @method static Builder|ProductImage newQuery()
 * @method static Builder|ProductImage query()
 * @method static Builder|ProductImage whereCreatedAt($value)
 * @method static Builder|ProductImage whereId($value)
 * @method static Builder|ProductImage whereProductId($value)
 * @method static Builder|ProductImage whereProductImageUrl($value)
 * @method static Builder|ProductImage whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class ProductImage extends Model
{
    protected $guarded = ['id'];

    use HasFactory;

    /**
     * @return BelongsTo<Product, ProductImage>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
