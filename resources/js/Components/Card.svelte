<script>
    export let productImages;
    export let productName;
    export let productDescription;
    export let primaryButtonText;
    export let productTargetGroups;
    export let productCategories;

    import { onMount } from "svelte";

    onMount(() => {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();
                document
                    .querySelector(this.getAttribute("href"))
                    .scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
            });
        });
    });
</script>

<div
    class="card md:card-side bg-base-100 shadow-xl m-6 rounded w-96 h-[36rem] max-w-md min-w-sm md:max-w-none md:w-[42rem] md:h-72"
>
    <div class="carousel md:max-w-xs md:min-w-sm h-72 w-96 md:w-auto">
        {#each productImages as productImage, productImageIndex}
            <div
                id={"product-image-" +
                    productImage.product_id +
                    productImageIndex}
                class="carousel-item relative w-full mx-1"
            >
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
                            href={"#product-image-" +
                                productImage.product_id +
                                Number(productImages.length - 1)}
                            class="btn btn-circle">❮</a
                        >
                        <a
                            href={"#product-image-" +
                                productImage.product_id +
                                Number(productImageIndex + 1)}
                            class="btn btn-circle">❯</a
                        >
                    {:else if productImageIndex === productImages.length - 1}
                        <!-- This is the last image of the array -->
                        <a
                            href={"#product-image-" +
                                productImage.product_id +
                                Number(productImageIndex - 1)}
                            class="btn btn-circle">❮</a
                        >
                        <a
                            href={"#product-image-" +
                                productImage.product_id +
                                0}
                            class="btn btn-circle">❯</a
                        >
                    {:else}
                        <!-- This is neither the 1st or last image of the array, for example image 2 between 1 and 3 -->
                        <a
                            href={"#product-image-" +
                                productImage.product_id +
                                Number(productImageIndex - 1)}
                            class="btn btn-circle">❮</a
                        >
                        <a
                            href={"#product-image-" +
                                productImage.product_id +
                                Number(productImageIndex + 1)}
                            class="btn btn-circle">❯</a
                        >
                    {/if}
                </div>
            </div>
        {/each}
    </div>
    <div class="card-body">
        <h2 class="card-title">{productName}</h2>
        <p class="break-words">{productDescription}</p>
        <div class="card-actions justify-start">
            {#each productCategories as productCategory}
                <div class="badge badge-accent">{productCategory.name}</div>
            {/each}
            {#each productTargetGroups as productTargetGroup}
                <div class="badge badge-secondary">
                    {productTargetGroup.name}
                </div>
            {/each}
        </div>
        <div class="card-actions justify-end mt-4">
            <button class="btn btn-primary">{primaryButtonText}</button>
        </div>
    </div>
</div>
