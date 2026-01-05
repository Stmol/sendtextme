<script lang="ts">
    import { useDialog } from '$lib/client/hooks';
    import { LoadingButton } from '$lib/components/app/button';
    import { Button } from '$lib/components/ui';

    const { onActionButtonClick, onCancel } = $props();
    const { isInteractible } = useDialog();

    let isLoading = $state(false);

    async function onCancelClick() {
        if (!$isInteractible) return;

        onCancel();
    }

    async function onDeleteButtonClick(event: MouseEvent) {
        event.stopPropagation();

        if (!$isInteractible) return;

        isLoading = true;
        await onActionButtonClick();
        isLoading = false;
    }
</script>

<h2 class="text-2xl font-semibold tracking-tight">Delete Space 💥</h2>
<p class="my-6 text-sm font-medium leading-none text-muted-foreground">
    All notes in this space will be permanently deleted. <br /><br />This action cannot be undone.
</p>

<div class="flex gap-2">
    <Button variant="outline" class="flex-1 uppercase" onclick={onCancelClick}>Cancel</Button>
    <LoadingButton
        title="Delete"
        showLoader={isLoading}
        onClick={onDeleteButtonClick}
        class="flex-1"
        variant="destructive"
    />
</div>
