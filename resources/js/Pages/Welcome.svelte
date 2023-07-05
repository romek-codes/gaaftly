<script>
    import { Link, page } from "@inertiajs/svelte";
    import Card from "@/Components/Card.svelte";
    import Navbar from "@/Components/Navbar.svelte";
    export let canLogin, canRegister;
</script>

<svelte:head>
    <title>Welcome to Gaaftly</title>
</svelte:head>

<div class="min-h-screen">
    <Navbar canLogin={canLogin} canRegister={canRegister} user={$page.props.auth.user}></Navbar>

    {#each $page.props.products as product}
        <p>product</p>
    {/each}

    <Card productImageUrl={"Product Image URL"} productName={"Test Product"} productDescription={"Test Product Description"} primaryButtonText={"Buy @ ShopName"}></Card>
</div>
