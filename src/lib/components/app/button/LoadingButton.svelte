<script lang="ts">
    import { Button } from '$lib/components/ui';
    import { Loader } from 'lucide-svelte';

    const { showLoader = false, isDisabled = false, title, onClick, ...rest } = $props();
</script>

<Button disabled={showLoader || isDisabled} onclick={onClick} {...rest}>
    {#if showLoader}
        <Loader size={16} strokeWidth={1.5} absoluteStrokeWidth class="animate-slow-spin" />
    {:else}
        <span class="uppercase">{title}</span>
    {/if}
</Button>
