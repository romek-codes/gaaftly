<script>
    import { page } from "@inertiajs/svelte";
    import { router } from "@inertiajs/svelte";
    import VirtualList from "svelte-tiny-virtual-list";
    import InfiniteLoading from "svelte-infinite-loading";
    import Card from "@/Components/Card.svelte";
    import { onMount, onDestroy } from "svelte";

    let dynamicItemSize;

    const updateDynamicItemSize = () => {
        if (window.innerWidth <= 768) {
            dynamicItemSize = 600;
        } else {
            dynamicItemSize = 350;
        }
    };

    onMount(() => {
        window.addEventListener("resize", updateDynamicItemSize);
        updateDynamicItemSize(); // initial setting
    });

    onDestroy(() => {
        window.removeEventListener("resize", updateDynamicItemSize);
    });

    let items = $page.props.products.data;

    function infiniteHandler({ detail: { loaded, complete, error } }) {
        console.log(items);
        try {
            if ($page.props.products.next_page_url === null) {
                complete();
            }

            router.visit($page.props.products.next_page_url, {
                preserveState: true,
                preserveScroll: true,
                only: ["products"],
                onSuccess: (page) => {
                    items = [...items, ...page.props.products.data];
                    loaded();
                },
            });
        } catch (e) {
            error(e);
        }
    }
</script>

<!-- If centering really doesnt work just use 24rem as width -->
<VirtualList
    width="100%"
    height={1200}
    itemCount={items.length}
    itemSize={dynamicItemSize} >
    <div class="flex justify-center" slot="item" let:index let:style {style}>
        <Card
            productImages={items[index].images}
            productName={items[index].name}
            productDescription={items[index].description}
            primaryButtonText={"Buy @" + items[index].product_store}
            productTargetGroups={items[index].target_groups}
            productCategories={items[index].categories}
        />
    </div>
    <div slot="footer">
        <InfiniteLoading on:infinite={infiniteHandler} />
    </div>
</VirtualList>
