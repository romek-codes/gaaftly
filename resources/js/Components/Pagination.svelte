<script>
    import { Link } from "@inertiajs/svelte";
    export let links = [];
</script>

<div class="join">
    {#each links as link, key (key)}
        <Link
            href={link.url}
            class="join-item btn {link.active ? 'btn-active' : ''}"
            >{@html link.label}
        </Link>
    {/each}
</div>
