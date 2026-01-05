import { MAX_NOTES_COUNT_DEFAULT } from '$lib/constants';
import { generateEncryptionKey } from '$lib/server/encrypt';
import { guardBySpacePassword } from '$lib/server/guards/space-password';
import { hashPassword } from '$lib/server/hashing';
import prisma from '$lib/server/prisma';
import { generateUniqueId } from '$lib/utils/uid';
import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import type {
    CreateSpaceRequest,
    DeleteSpaceRequest,
    DeleteSpaceResponse,
    SpacesPostResponse,
} from './types';

/**
 * Create a space
 */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
    const createSpaceData = (await request.json()) as CreateSpaceRequest;
    const uid = generateUniqueId();
    const { key, salt } = generateEncryptionKey(createSpaceData.password);

    const fiveDaysFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5); // 5 days
    const oneHourFromNow = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const hashedPassword = await hashPassword(createSpaceData.password);
    const expiresAt = createSpaceData.save ? fiveDaysFromNow : oneHourFromNow;

    const space = await prisma.spaces.create({
        data: {
            uid,
            password: hashedPassword,
            salt,
            maxNotesCount: MAX_NOTES_COUNT_DEFAULT,
            spaces_access: {
                create: {
                    sessionId: locals.session.id,
                    expiresAt: expiresAt,
                },
            },
        },
    });

    return json({
        uid: space.uid,
        key,
        expiresAt: expiresAt.toISOString(),
        maxNotesCount: space.maxNotesCount,
    } as SpacesPostResponse);
};

/**
 * Delete a space
 */
export const DELETE: RequestHandler = async (event: RequestEvent) => {
    const deleteSpaceData = (await event.request.json()) as DeleteSpaceRequest;
    if (!deleteSpaceData?.spaceUid) {
        error(400, {
            message: 'Space information is required',
            code: 400,
        });
    }

    await guardBySpacePassword(event.cookies, deleteSpaceData.spaceUid);

    // TODO: handle errors
    const space = await prisma.spaces.delete({
        where: {
            uid: deleteSpaceData.spaceUid,
            spaces_access: {
                some: {
                    sessionId: event.locals.session.id,
                },
            },
        },
    });

    return json({
        spaceUid: space.uid,
    } satisfies DeleteSpaceResponse);
};
