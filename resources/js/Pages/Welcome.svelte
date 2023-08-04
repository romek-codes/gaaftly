<script context="module">
    export { default as layout } from "../Layouts/GuestLayout.svelte";
</script>

<script>
    import Products from "@/Components/Products.svelte";
    import Test from "@/Components/Test.svelte";
</script>

<svelte:head>
    <title>Gaaftly</title>
</svelte:head>

<div class="min-h-screen flex flex-wrap justify-center">
    <Test />
    <!-- <Products /> -->
    <!-- <Pagination links={products.links} /> -->
</div>
