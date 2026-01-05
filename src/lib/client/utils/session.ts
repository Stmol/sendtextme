import { getCookie } from '$lib/client/utils/cookies';
import { SESSION_UID_COOKIE_NAME } from '$lib/constants';

export function getSessionId(): string | null {
    return getCookie(SESSION_UID_COOKIE_NAME);
}
