<script lang="ts">
    import { useGlobalToast } from '$lib/stores/toast';
    import { CircleCheck, CircleX } from 'lucide-svelte';
    import { fly } from 'svelte/transition';

    const globalToasts = useGlobalToast();

    function dismissToast(toastId: string) {
        globalToasts.removeToast(toastId);
    }
</script>

<div class="fixed right-5 top-5 z-[9999] flex flex-col-reverse gap-2.5">
    {#each $globalToasts as toast (toast.id)}
        <button
            class="max-w-[300px] cursor-pointer rounded py-3 pl-4 pr-5 text-sm shadow-md transition-colors duration-200"
            transition:fly={{ x: 100, duration: 300 }}
            onclick={() => dismissToast(toast.id)}
            class:error={toast.type === 'error'}
            class:success={toast.type === 'success'}
        >
            <div class="flex items-center gap-1.5">
                {#if toast.type === 'success'}
                    <CircleCheck size={16} strokeWidth={1.5} />
                {:else}
                    <CircleX size={16} strokeWidth={1.5} />
                {/if}
                {toast.message}
            </div></button
        >
    {/each}
</div>

<style lang="postcss">
    .error {
        @apply bg-red-200 text-red-900 hover:bg-red-400;
    }

    .success {
        @apply bg-green-200 text-green-900 hover:bg-green-400;
    }
</style>
