import { writable } from 'svelte/store';

const { subscribe, set } = writable<boolean>(false);

export const useSpaceAuth = () => {
    const setIsAuthorized = (authorized: boolean) => {
        set(authorized);
    };

    return {
        subscribe,
        setIsAuthorized,
    };
};
