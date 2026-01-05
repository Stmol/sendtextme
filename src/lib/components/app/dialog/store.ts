import { writable } from 'svelte/store';

export type ShowDialogState = {
    isCloseable: boolean;
    content: () => any;
};

export const showDialog = writable<ShowDialogState | null>(null);
