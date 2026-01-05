import { useSpaceAuth } from '$lib/client/hooks';
import { clientId } from '$lib/client/network/client-id';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
    const spaceAuth = useSpaceAuth();

    options.headers = {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
    };

    const response = await fetch(url, {
        ...options,
        headers: new Headers(options.headers || {}),
    });

    if (response.status === 401) {
        spaceAuth.setIsAuthorized(false);
    }

    return response;
};
