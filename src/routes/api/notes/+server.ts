import { guardBySpacePassword } from '$lib/server/guards/space-password';
import prisma from '$lib/server/prisma';
import type { NotesGetResponse } from '@api/notes/types';
import { error, json, type RequestEvent } from '@sveltejs/kit';
import { pick } from 'es-toolkit';
import type { RequestHandler } from './$types';

/**
 * Get list of notes in a space
 */
export const GET: RequestHandler = async (event: RequestEvent) => {
    const { url, cookies } = event;
    const spaceUid = url.searchParams.get('spaceUid');
    if (!spaceUid) {
        error(404, {
            message: 'Space not found',
            code: 404,
        });
    }

    await guardBySpacePassword(cookies, spaceUid);

    const notes = await prisma.notes.findMany({
        where: {
            space: {
                uid: spaceUid,
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    return json({
        notes: notes.map((note) => {
            const [iv, tag] = note.encryptionData.split(',');

            return {
                ...pick(note, ['id', 'uid', 'content', 'updatedAt']),
                iv,
                tag,
            };
        }),
    } satisfies NotesGetResponse);
};
