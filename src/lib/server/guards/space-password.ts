import prisma from '$lib/server/prisma';
import { getSessionUid } from '$lib/server/session';
import { error, type Cookies } from '@sveltejs/kit';

export const guardBySpacePassword = async (cookies: Cookies, spaceUid: string) => {
    const sessionUid = getSessionUid(cookies);
    if (!sessionUid) {
        error(401, {
            message: 'Access denied',
            code: 401,
        });
    }

    const access = await prisma.spaces_access.findFirst({
        where: {
            session: {
                uid: sessionUid,
            },
            space: {
                uid: spaceUid,
            },
        },
    });

    if (!access) {
        error(401, {
            message: 'Access denied',
            code: 401,
        });
    }
};
