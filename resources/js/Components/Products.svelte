<!-- // import VirtualList from "svelte-tiny-virtual-list";
    // import InfiniteLoading from "svelte-infinite-loading";

    // let products = new Map(); // Make sure `products` is only declared once at the beginning
    // let currentPage = 1;
    // let itemCounter = 1;
    // let productsArray = [];

    // $: if ($page.props.products) {
        const newProducts = $page.props.products.data;

        newProducts.forEach((product) => {
            if (!products.has(product.id)) {
                products.set(product.id, product);
            }
        });

        // Move the update statement here
        productsArray = Array.from(products.values());

        // correct item counter
        itemCounter = products.size;

        currentPage = $page.props.products.current_page;
    }

    let lastPage;

    $: lastPage = $page.props.products.last_page;

    async function infiniteHandler({ detail: { complete, error } }) {
        try {
            // check if we're already on last page
            if (currentPage >= lastPage) {
                complete("stop");
                return;
            }

            currentPage++; // increment page number

            // Use Inertia's visit method to make the request
            const page = await router.visit(`/?page=${currentPage}`, {
                replace: true,
                preserveScroll: true,
                preserveState: true,
            });

            // The response data is in the page.props property
            let data = page.props;

            // check if data is there and append to existing data
            if (data && data.products.data.length > 0) {
                const newProducts = data.products.data;
                newProducts.forEach((product) => {
                    if (!products.has(product.id)) {
                        products.set(product.id, product);
                    }
                });

                productsArray = Array.from(products.values());
                itemCounter = products.size;
            }
        } catch (e) {
            console.error(e);
            error();
        } finally {
            // check if there's still more data to be loaded
            complete(currentPage < lastPage ? "" : "stop");
        }
    }

    // rest of the component remains as is... -->

<script>
    import { page } from "@inertiajs/svelte";
    import { router } from "@inertiajs/svelte";
    import VirtualList from "svelte-tiny-virtual-list";
    import InfiniteLoading from "svelte-infinite-loading";
    import Card from "@/Components/Card.svelte";
    let currentPage = 1;
    let listHeight = 0;
    $: newProducts = [];

    function infiniteHandler({ detail: { loaded, complete } }) {
        router.visit(`/?page=${currentPage}`, {
            replace: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                $page.props.products.data.forEach((product) => {
                    console.log(newProducts);
                    newProducts.push(product);
                    loaded();
                    currentPage++;
                });
            },
        });
    }
</script>

<div id="virtual-list" bind:offsetHeight={listHeight} class="grow">
    <VirtualList
        itemCount={newProducts.length}
        width="100%"
        height={listHeight}
        itemSize={350}
    >
        <div slot="item" let:index let:style {style}>
            {#if newProducts[index]}
                <Card
                    productImages={newProducts[index].images}
                    productName={newProducts[index].name}
                    productDescription={newProducts[index].description}
                    primaryButtonText={"Buy @" +
                        newProducts[index].product_store}
                    productTargetGroups={newProducts[index].target_groups}
                    productCategories={newProducts[index].categories}
                />
            {/if}
        </div>
        <div slot="footer">
            <InfiniteLoading on:infinite={infiniteHandler} />
        </div>
    </VirtualList>
</div>
