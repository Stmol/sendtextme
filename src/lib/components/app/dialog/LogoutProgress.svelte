<script>
    import { Loader } from 'lucide-svelte';
    import { onMount } from 'svelte';

    const { urlToRefresh = null } = $props();

    let showRefresh = $state(false);

    onMount(() => {
        if (!urlToRefresh) return;

        setTimeout(() => {
            showRefresh = true;
        }, 3000);
    });
</script>

<div class="flex flex-col items-center justify-center space-y-4 p-4">
    <div class="flex items-center space-x-2">
        <Loader class="animate-slow-spin" size={18} />
        <p>Logging out...</p>
    </div>

    {#if showRefresh && urlToRefresh}
        <div>
            <a class="text-sm font-medium" href={urlToRefresh}>Refresh</a>
        </div>
    {/if}
</div>
