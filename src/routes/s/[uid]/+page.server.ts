import prisma from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export type SpacePageData = {
    spaceUid: string;
    isAuthorized: boolean;
    maxNotesCount: number;
};

// TODO: Why is it working?
export const ssr = false;

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
    const uid = params.uid;
    const sessionId = locals.session.id;

    const space = await prisma.spaces.findUnique({
        where: {
            uid,
        },
        include: {
            spaces_access: {
                where: {
                    sessionId,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            },
        },
    });

    if (!space) {
        error(404, {
            message: 'Not found',
            code: 404,
        });
    }

    const sessionHasAccess = space.spaces_access.some((access) => access.sessionId === sessionId);

    return {
        spaceUid: space.uid,
        isAuthorized: sessionHasAccess,
        maxNotesCount: space.maxNotesCount,
    } satisfies SpacePageData;
};
