import { writable } from 'svelte/store';

type ToastType = 'error' | 'success';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

const { subscribe, update } = writable<ToastMessage[]>([]);

export const useGlobalToast = () => {
    const showToast = (message: string, type: ToastType) => {
        const id = crypto.randomUUID();
        update((toasts) => [...toasts, { id, message, type }]);
        setTimeout(() => {
            update((toasts) => toasts.filter((t) => t.id !== id));
        }, 2200);
    };

    return {
        subscribe,
        showError: (message: string) => showToast(message, 'error'),
        showSuccess: (message: string) => showToast(message, 'success'),
        removeToast: (toastId: string) => {
            update((toasts) => toasts.filter((t) => t.id !== toastId));
        },
    };
};
