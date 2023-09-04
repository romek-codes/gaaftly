<script>
    import { page } from "@inertiajs/svelte";
    let categories = $page.props.categories;
    let target_groups = $page.props.target_groups;
</script>

<div
    class="flex justify-start p-8 mt-6 mr-4 left-2 fixed bg-secondary rounded-sm max-h-min h-fit w-fit"
>
    <select class="select select-bordered w-full max-w-xs min-w-min">
        <option disabled selected>Who shot first?</option>
        <option>Han Solo</option>
        <option>Greedo</option>
    </select>
</div>
