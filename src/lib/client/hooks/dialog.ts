import { derived, get, writable } from 'svelte/store';

type DialogStore = {
    component?: any;
    isDismissable: boolean;
    isInteractible: boolean;
    componentProps?: Record<string, unknown>;
};

type ShowDialogConfig = Omit<DialogStore, 'isInteractible'>;

const defaultDialogStore: DialogStore = {
    component: null,
    isDismissable: true,
    isInteractible: true,
    componentProps: {},
};

const dialogStore = writable<DialogStore>(defaultDialogStore);

const isShowing = derived(dialogStore, (dialog) => dialog.component !== null);
const isDismissable = derived(dialogStore, (dialog) => dialog.isDismissable);
const isInteractible = derived(dialogStore, (dialog) => dialog.isInteractible);

export function useDialog() {
    function showDialog(config: ShowDialogConfig) {
        if (get(isShowing)) return;

        dialogStore.update((dialog) => ({
            ...dialog,
            component: config.component,
            isDismissable: config.isDismissable ?? true,
            componentProps: config.componentProps ?? {},
        }));
    }

    function closeDialog(onAfterClose?: () => void) {
        dialogStore.set(defaultDialogStore);
        onAfterClose?.();
    }

    function setInteractible(value: boolean) {
        dialogStore.update((dialog) => ({
            ...dialog,
            isInteractible: value,
        }));
    }

    return {
        dialogStore,
        isShowing,
        isDismissable,
        isInteractible,
        setInteractible,
        showDialog,
        closeDialog,
    };
}
