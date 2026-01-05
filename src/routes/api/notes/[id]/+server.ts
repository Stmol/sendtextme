import eventEmitter from '$lib/server/eventemitter';
import { guardBySpacePassword } from '$lib/server/guards/space-password';
import prisma from '$lib/server/prisma';
import type {
    DeleteNoteRequest,
    DeleteNoteResponse,
    UpdateNoteRequest,
    UpdateNoteResponse,
} from '@api/notes/types';
import { error, json, type RequestEvent } from '@sveltejs/kit';
import { pick } from 'es-toolkit';

export const PUT = async (event: RequestEvent) => {
    const { id } = event.params;
    const { content, spaceUid, iv, tag }: UpdateNoteRequest = await event.request.json();

    if (!content?.trim()) {
        error(400, {
            message: 'Content cannot be empty',
            code: 400,
        });
    }

    await guardBySpacePassword(event.cookies, spaceUid);

    if (!content || !spaceUid) {
        error(400, {
            message: 'Invalid request',
            code: 400,
        });
    }

    try {
        const updatedNote = await prisma.notes.update({
            where: { id: Number(id) },
            data: { content, encryptionData: `${iv},${tag}` },
        });

        eventEmitter.emit('db.notes.updated', updatedNote, event.locals.clientId);

        return json({
            ...pick(updatedNote, ['id', 'uid', 'content', 'updatedAt']),
            iv,
            tag,
        } satisfies UpdateNoteResponse);
    } catch (err) {
        throw new Error('Error updating note: ' + err);
    }
};

export const DELETE = async (event: RequestEvent) => {
    const { id }: DeleteNoteRequest = await event.request.json();
    if (!id) {
        error(400, {
            message: 'Invalid request',
            code: 400,
        });
    }

    const note = await prisma.notes.findUnique({
        where: { id: Number(id) },
        include: {
            space: true,
        },
    });

    if (!note) {
        error(404, {
            message: 'Note not found',
            code: 404,
        });
    }

    await guardBySpacePassword(event.cookies, note.space.uid);

    try {
        const noteDeletion = prisma.notes.delete({
            where: { id: Number(id) },
        });

        const spaceUpdate = prisma.spaces.update({
            where: {
                uid: note.space.uid,
                notesCount: { gt: 0 },
            },
            data: {
                notesCount: {
                    decrement: 1,
                },
            },
        });

        const [deletedNote, _] = await prisma.$transaction([noteDeletion, spaceUpdate]);

        eventEmitter.emit('db.notes.deleted', deletedNote, event.locals.clientId);

        return json({
            id: deletedNote.id,
        } satisfies DeleteNoteResponse);
    } catch (err) {
        error(500, {
            message: 'Error deleting note',
            code: 500,
        });
    }
};
