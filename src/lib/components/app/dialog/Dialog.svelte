<script lang="ts">
    import { useDialog } from '$lib/client/hooks';

    const { dialogStore, closeDialog, isShowing, isDismissable, isInteractible } = useDialog();
    const DialogContent = $derived($dialogStore.component);

    let isDialogBumpAnimating = $state(false);

    isShowing.subscribe((isShowing) => {
        if (isShowing) {
            animateDialogBump();
        }
    });

    function onDialogDismiss() {
        if (!$isDismissable || !$isInteractible) {
            animateDialogBump();
        } else {
            closeDialog();
        }
    }

    function animateDialogBump() {
        if (isDialogBumpAnimating) return;
        isDialogBumpAnimating = true;

        setTimeout(() => {
            isDialogBumpAnimating = false;
        }, 200);
    }
</script>

{#if $isShowing}
    <dialog-div>
        <div class="fixed inset-0 z-10 bg-black bg-opacity-50"></div>
        <div
            onclick={onDialogDismiss}
            class="custom-modal fixed inset-0 z-20 flex items-center justify-center"
        >
            <div
                class="rounded-lg bg-white p-6 shadow-lg"
                class:animate-scale-in={isDialogBumpAnimating}
                onclick={(event) => event.stopPropagation()}
            >
                <DialogContent {...$dialogStore?.componentProps} />
            </div>
        </div>
    </dialog-div>
{/if}
