<script>
    import { Link, page } from "@inertiajs/svelte";
    import VirtualList from "svelte-tiny-virtual-list";
    import Card from "@/Components/Card.svelte";
    let products = []; // This will hold all products.

    $: if ($page.props.products) {
        products = [...products, ...$page.props.products.data]; // Append new products to the list
    }
</script>

<VirtualList
    itemCount={products.length}
    let:index
    let:style
    height="500"
    itemSize="50"
>
    <div slot="item" {style}>
        <Card
            productImages={products[index].images}
            productName={products[index].name}
            productDescription={products[index].description}
            primaryButtonText={"Buy @" + products[index].product_store}
            productTargetGroups={products[index].target_groups}
            productCategories={products[index].categories}
        />
    </div>
</VirtualList>
