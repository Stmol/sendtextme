<script lang="ts">
    import { Button } from '$lib/components/ui';

    let {
        onDiscard = () => {},
        onCancel = () => {},
    }: { onDiscard: () => void; onCancel: () => void } = $props();
</script>

<h2 class="text-2xl font-semibold tracking-tight">Discard changes? 🙈</h2>
<p class="my-6 text-sm font-medium leading-none text-muted-foreground">You have unsaved changes</p>

<div class="flex gap-2">
    <Button variant="outline" class="flex-1 uppercase" onclick={onCancel}>Cancel</Button>
    <Button variant="destructive" class="flex-1 uppercase" onclick={onDiscard}>Discard</Button>
</div>
