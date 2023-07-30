<script context="module">
    export { default as layout } from "../Layouts/GuestLayout.svelte";
</script>

<script>
    import { Link, page } from "@inertiajs/svelte";
    import Card from "@/Components/Card.svelte";
    import Navbar from "@/Components/Navbar.svelte";
    import Pagination from "@/Components/Pagination.svelte";
    import Products from "@/Components/Products.svelte";
    export let products = {};
    // export let canLogin, canRegister;

    import { onMount } from "svelte";
    import { router } from "@inertiajs/svelte";

    let page_id = 0;

    onMount(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    });

    function handleScroll() {
        let scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop;
        let windowHeight = window.innerHeight;
        let fullHeight =
            document.documentElement.scrollHeight || document.body.scrollHeight;
        if (scrollTop + windowHeight >= fullHeight - 1600) {
            loadMore();
        }
    }

    let loading = false; // New flag

    function loadMore() {
        if (loading) return; // if there's a request going on, stop here

        loading = true; // Flag that a request is going on
        page_id++;
        router.visit(`/?page=${page_id}`, {
            replace: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                loading = false; // When request is complete, allow further requests
                if (page_id > $page.props.products.last_page) {
                    window.removeEventListener("scroll", handleScroll);
                }
            },
        });
    }
</script>

<svelte:head>
    <title>Gaaftly</title>
</svelte:head>

<div class="min-h-screen flex flex-wrap justify-center">
    <Products />
    <Pagination links={products.links} />
</div>
