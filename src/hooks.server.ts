import { rateLimiterHook } from '$lib/server/rate-limiter';
import { handleSessionHook } from '$lib/server/session';
import { type Handle, type RequestEvent } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    await handleSessionHook(event);
    handleSseClientIdHeader(event);

    if (event.url.pathname.startsWith('/api/')) {
        const rateLimitResponse = await rateLimiterHook(event);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
    }

    return await resolve(event);
};

// TODO: move it to separate hook file
function handleSseClientIdHeader(event: RequestEvent) {
    const clientId = event.request.headers.get('x-client-id');
    if (!clientId) return;

    event.locals.clientId = clientId;
}
