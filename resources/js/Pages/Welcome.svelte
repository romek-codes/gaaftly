<script context="module">
    export { default as layout } from "../Layouts/GuestLayout.svelte";
</script>

<script>
    import { Link, page } from "@inertiajs/svelte";
    import Card from "@/Components/Card.svelte";
    import Navbar from "@/Components/Navbar.svelte";
    // export let canLogin, canRegister;
</script>

<svelte:head>
    <title>Welcome to Gaaftly</title>
</svelte:head>
<!-- <Navbar canLogin={canLogin} canRegister={canRegister} user={$page.props.auth.user}></Navbar> -->

<div class="min-h-screen">
    {#each $page.props.products as product}
        <Card productImages={product.images} productName={product['name']} productDescription={product['description']} primaryButtonText={"Buy @" + product['product_store']}></Card>
    {/each}
</div>
