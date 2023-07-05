<script>
    import { Link, page } from "@inertiajs/svelte";
    export let canLogin, canRegister, user;
</script>

<div class="navbar bg-base-100">
    <div class="navbar-start">
        <div class="dropdown">
            <label tabindex="0" class="btn btn-ghost rounded">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h7"
                    /></svg
                >
            </label>
            <ul
                tabindex="0"
                class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
                <li><a>Homepage</a></li>
                <li><a>Portfolio</a></li>
                <li><a>About</a></li>
            </ul>
        </div>
    </div>
    <div class="navbar-center">
        <Link class="text-2xl normal-case btn btn-ghost" href="/blog">
            <img src="logo.svg" class="w-10 h-10" />
            Gaaftly
        </Link>
    </div>
    <div class="navbar-end">
        {#if canLogin}
            <div class="p-6 text-right">
                {#if $page.props.auth.user}
                    <Link
                        href={route("dashboard")}
                        class="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                        >Dashboard</Link
                    >
                {:else}
                    {#if canLogin}
                        <Link
                            href={route("login")}
                            class="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >Login</Link
                        >
                    {/if}

                    {#if canRegister}
                        <Link
                            href={route("register")}
                            class="ml-4 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >Register</Link
                        >
                    {/if}
                {/if}
            </div>
        {/if}
    </div>
</div>
