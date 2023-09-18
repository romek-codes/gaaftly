<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\ProductTargetGroups
 *
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $product_id
 * @property int $target_group_id
 *
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups whereTargetGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductTargetGroups whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class ProductTargetGroups extends Model
{
    protected $guarded = ['id'];

    use HasFactory;
}
