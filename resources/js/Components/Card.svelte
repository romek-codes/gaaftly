<script>
    export let productImages;
    export let productName;
    export let productDescription;
    export let primaryButtonText;
</script>

<div class="card lg:card-side bg-base-100 shadow-xl m-6 rounded">
    <div class="carousel ">
        {#each productImages as productImage, productImageIndex}
            <div id={"" + productImage.product_id + productImageIndex} class="carousel-item relative w-full">
                <img
                    src={productImage.product_image_url}
                    class="w-full"
                    alt={productName}
                />
                <div
                    class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
                    >
                    {#if productImages.length === 1}
                        <!-- There is only one image, no need for controls -->
                    {:else if productImageIndex == 0}
                        <!-- This is the first image of the array -->
                        <a
                            href={"#" + productImage.product_id + Number(productImages.length - 1)}
                            class="btn btn-circle">❮</a
                        >
                        <a
                            href={"#" + productImage.product_id + Number(productImageIndex + 1)}
                            class="btn btn-circle">❯</a
                        >
                    {:else if productImageIndex === productImages.length - 1}
                            <!-- This is the last image of the array -->
                        <a
                            href={"#" + productImage.product_id + Number(productImageIndex - 1)}
                            class="btn btn-circle">❮</a
                        >
                        <a
                            href={"#" + productImage.product_id + 0}
                            class="btn btn-circle">❯</a
                        >
                    {:else}
                            <!-- This is neither the 1st or last image of the array, for example image 2 between 1 and 3 -->
                        <a
                            href={"#" + productImage.product_id + Number(productImageIndex - 1)}
                            class="btn btn-circle">❮</a
                        >
                        <a
                            href={"#" + productImage.product_id + Number(productImageIndex + 1)}
                            class="btn btn-circle">❯</a
                        >
                    {/if}
                </div>
            </div>
        {/each}
    </div>
    <div class="card-body">
        <h2 class="card-title">{productName}</h2>
        <p>{productDescription}</p>
        <div class="card-actions justify-end">
            <button class="btn btn-primary">{primaryButtonText}</button>
        </div>
    </div>
</div>
