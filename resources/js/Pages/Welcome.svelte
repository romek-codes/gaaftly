<script context="module">
    export { default as layout } from "../Layouts/GuestLayout.svelte";
</script>

<script>
    import Products from "@/Components/Products.svelte";
</script>

<svelte:head>
    <title>Gaaftly</title>
</svelte:head>

<div class="min-h-screen flex flex-row justify-center">
    <Products />
    <!-- <Pagination links={products.links} /> -->
</div>
