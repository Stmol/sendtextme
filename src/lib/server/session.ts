import { SESSION_UID_COOKIE_NAME } from '$lib/constants';
import prisma from '$lib/server/prisma';
import { generateUniqueId } from '$lib/utils/uid';
import { type Cookies, type RequestEvent } from '@sveltejs/kit';

// TODO: move to hooks
export const handleSessionHook = async (event: RequestEvent) => {
    let sessionId = getSessionUid(event.cookies);

    if (!sessionId) {
        const uid = generateUniqueId(32);
        setCookieWithSessionId(event.cookies, uid);
        sessionId = uid;
    }

    const session = await prisma.sessions.upsert({
        where: {
            uid: sessionId,
        },
        update: {
            lastHitAt: new Date(),
        },
        create: {
            uid: sessionId,
        },
    });

    event.locals.session = session;
};

export const getSessionUid = (cookies: Cookies) => {
    return cookies.get(SESSION_UID_COOKIE_NAME);
};

export const deleteCookieWithSessionId = (cookies: Cookies) => {
    cookies.delete(SESSION_UID_COOKIE_NAME, { path: '/' });
};

const setCookieWithSessionId = (cookies: Cookies, sessionId: string) => {
    cookies.set(SESSION_UID_COOKIE_NAME, sessionId, {
        path: '/',
        httpOnly: false,
        secure: true,
        // TODO: delete old session
        maxAge: 60 * 60 * 24 * 300, // 30 days
    });
};
