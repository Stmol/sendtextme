import { guardBySpacePassword } from '$lib/server/guards/space-password';
import prisma from '$lib/server/prisma';
import { error, json, type RequestHandler } from '@sveltejs/kit';

type LogoutRequest = {
    spaceUid: string;
};

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
    const logoutData = (await request.json()) as LogoutRequest;
    if (!logoutData?.spaceUid) {
        error(400, {
            message: 'Space data is required',
            code: 400,
        });
    }

    await guardBySpacePassword(cookies, logoutData.spaceUid);

    await prisma.spaces_access.deleteMany({
        where: {
            sessionId: locals.session.id,
            space: {
                uid: logoutData.spaceUid,
            },
        },
    });

    return json({ success: true });
};
