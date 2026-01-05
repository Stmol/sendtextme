<script lang="ts">
    import { clearExpiredDataInStorage } from '$lib/client/utils';
    import { onMount } from 'svelte';

    const { children } = $props();

    onMount(() => {
        clearExpiredDataInStorage(() => {
            window.location.reload();
        });
    });
</script>

{@render children()}
