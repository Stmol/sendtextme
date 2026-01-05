import { errors } from '$lib/stores/errors';

export function handleError(error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    errors.add(message);
}
