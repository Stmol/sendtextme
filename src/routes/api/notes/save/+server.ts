import eventEmitter from '$lib/server/eventemitter';
import { guardBySpacePassword } from '$lib/server/guards/space-password';
import prisma from '$lib/server/prisma';
import { generateUniqueId } from '$lib/utils/uid';
import type { NoteDto, SaveNoteRequest } from '@api/notes/types';
import { type RequestEvent, type RequestHandler, error, json } from '@sveltejs/kit';
import { pick } from 'es-toolkit';

export const POST: RequestHandler = async (event: RequestEvent) => {
    const { content, spaceUid, iv, tag }: SaveNoteRequest = await event.request.json();

    if (!content?.trim()) {
        error(400, {
            message: 'Content cannot be empty',
            code: 400,
        });
    }

    await guardBySpacePassword(event.cookies, spaceUid);

    try {
        const space = await prisma.spaces.update({
            where: {
                uid: spaceUid,
                notesCount: {
                    lt: prisma.spaces.fields.maxNotesCount,
                },
            },
            data: {
                notesCount: {
                    increment: 1,
                },
                notes: {
                    create: {
                        content,
                        uid: generateUniqueId(16),
                        encryptionData: `${iv},${tag}`,
                        sessionId: event.locals.session.id,
                    },
                },
            },
            include: {
                notes: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        const note = space.notes[0];
        if (!note) {
            error(500, {
                message: 'Failed to create note',
                code: 500,
            });
        }

        eventEmitter.emit('db.notes.created', note, event.locals.clientId);

        return json({
            ...pick(note, ['id', 'uid', 'content', 'updatedAt']),
            iv,
            tag,
        } satisfies NoteDto);
    } catch (err) {
        error(500, {
            message: 'Error creating note',
            code: 500,
        });
    }
};
