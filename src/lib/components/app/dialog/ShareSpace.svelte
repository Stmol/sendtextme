<script lang="ts">
    import { Button } from '$lib/components/ui';

    const {
        onActionButtonClick,
        onCancel,
    }: {
        onActionButtonClick: () => void;
        onCancel: () => void;
    } = $props();
</script>

<h2 class="text-2xl font-semibold tracking-tight">Share Space 🔗</h2>
<p class="mt-2 text-sm font-medium leading-none text-muted-foreground">
    Copy the URL below to share link to this space
</p>

<div class="my-6">
    <div class="flex items-center rounded-md border bg-gray-50 p-3">
        <span class="flex-1 truncate text-sm text-gray-600">
            {window.location.href.split('#')[0]}
        </span>
    </div>
</div>

<div class="flex justify-end space-x-3">
    <Button class="w-full uppercase" variant="outline" onclick={() => onCancel()}>Close</Button>
    <Button class="w-full uppercase" onclick={onActionButtonClick}>Copy Link</Button>
</div>
