import { generateEncryptionKey } from '$lib/server/encrypt';
import { verifyPassword } from '$lib/server/hashing';
import prisma from '$lib/server/prisma';
import { getSessionUid } from '$lib/server/session';
import { error, json } from '@sveltejs/kit';

export interface CheckPasswordRequest {
    spaceUid: string;
    password: string;
    save: boolean;
}

export interface CheckPasswordResponse {
    spaceUid: string;
    key: string;
    expiresAt: string;
}

// Check if the password is correct
export const POST = async ({ request, cookies }) => {
    const sessionUid = getSessionUid(cookies);
    if (!sessionUid) {
        return error(403, {
            message: 'Access denied',
            code: 403,
        });
    }

    const data = (await request.json()) as CheckPasswordRequest;

    const space = await prisma.spaces.findUnique({
        where: { uid: data.spaceUid },
    });

    if (!space) {
        return error(404, {
            message: 'Space not found',
            code: 404,
        });
    }

    const isPasswordValid = await verifyPassword(data.password, space.password);
    if (!isPasswordValid) {
        return error(401, {
            message: 'Invalid password',
            code: 401,
        });
    }

    // TODO: remove duplicates
    const fiveDaysFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5); // 5 days
    const oneHourFromNow = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.spaces_access.deleteMany({
        where: {
            space: {
                uid: space.uid,
            },
            session: {
                uid: sessionUid,
            },
        },
    });

    const access = await prisma.spaces_access.create({
        data: {
            space: {
                connect: {
                    uid: space.uid,
                },
            },
            session: {
                connect: {
                    uid: sessionUid,
                },
            },
            expiresAt: data.save ? fiveDaysFromNow : oneHourFromNow,
        },
    });

    const { key } = generateEncryptionKey(data.password, space.salt);

    return json({
        spaceUid: space.uid,
        key,
        expiresAt: access.expiresAt.toISOString(),
    } satisfies CheckPasswordResponse);
};
