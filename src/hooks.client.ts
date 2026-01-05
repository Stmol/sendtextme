import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({
    error,
    event: NavigationEvent,
    status,
    message,
}) => {
    const errorId = crypto.randomUUID();

    console.log(error, event, status, message);

    return {
        message: 'Whoops!',
        errorId,
    };
};

export function handle({ event, resolve }) {
    console.log('Client hook triggered:', event);
    return resolve(event);
}
