<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\TargetGroup;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        // Create 20 target groups and 20 categories first
        TargetGroup::factory()->count(20)->create();
        Category::factory()->count(20)->create();

        // Create 200 products
        Product::factory()->count(200)->create()->each(function ($product) {
            // Attach an image to the product
            for ($i = 0; $i < rand(1, 5); $i++) {
                $product->images()->save(ProductImage::factory()->make());
            }

            // Attach the product to a random category and target group
            $product->targetGroups()->attach(TargetGroup::all()->random()->id);
            $product->categories()->attach(Category::all()->random()->id);
        });
    }

}
