<script>
    import { Link , page} from "@inertiajs/svelte";
    import ApplicationLogo from "../Components/ApplicationLogo.svelte";
    import Navbar from "@/Components/Navbar.svelte";
    export let canLogin, canRegister;
</script>

<div
    class="min-h-screen flex flex-col"
>
    <Navbar canLogin={canLogin} canRegister={canRegister} user={$page.props.auth.user}></Navbar>
    <slot />
</div>
