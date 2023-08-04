<!-- Items.svelte -->
<script>
    import { router } from "@inertiajs/svelte";
    import { onMount } from "svelte";
    import { page } from "@inertiajs/svelte";
    import VirtualList from "svelte-tiny-virtual-list";
    import InfiniteLoading from "svelte-infinite-loading";

    let items = $page.props.products.data;

    function infiniteHandler({ detail: { loaded, complete, error } }) {
        try {
            console.log("trying");
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

<VirtualList width="100%" height={600} itemCount={items.length} itemSize={350}>
    <div slot="item" let:index let:style {style}>
        {items[index].name}
        <button class="btn btn-primary">{items[index].description}</button>
    </div>

    <div slot="footer">
        <InfiniteLoading on:infinite={infiniteHandler} />
    </div>
</VirtualList>
