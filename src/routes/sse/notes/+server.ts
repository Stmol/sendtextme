import eventEmitter from '$lib/server/eventemitter';
import { guardBySpacePassword } from '$lib/server/guards/space-password';
import prisma from '$lib/server/prisma';
import type { notes } from '@prisma/client/edge';
import { error, type RequestHandler } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';
import { SseNotesEvent } from './types';

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
    const spaceUid = request.headers.get('x-space-uid');

    if (!spaceUid) {
        error(403, {
            message: 'Access denied',
            code: 403,
        });
    }

    await guardBySpacePassword(cookies, spaceUid);

    const space = await prisma.spaces.findUnique({
        where: {
            uid: spaceUid,
        },
    });

    if (!space) {
        error(404, {
            message: 'Space not found',
            code: 404,
        });
    }

    return produce(async function start({ emit }) {
        const handler = (
            eventName: SseNotesEvent,
            { note, clientId }: { note: notes; clientId: string | undefined },
        ) => {
            if (!note || !clientId) return;
            if (note.spaceId !== space.id) return;

            try {
                const body = `${clientId};${note.id}`;
                const { error } = emit(eventName, body);

                if (error) {
                    if (error.message.includes('Client disconnected')) {
                        console.error(`SSE client disconnected`);
                        return;
                    }

                    throw error;
                }
            } catch (err) {
                console.error(`SSE handler error for ${eventName}:`, err);
            }
        };

        const onNoteCreated = (note: notes, clientId: string | undefined) =>
            handler(SseNotesEvent.CREATED, { note, clientId });
        eventEmitter.on('db.notes.created', onNoteCreated);

        const onNoteUpdated = (note: notes, clientId: string | undefined) =>
            handler(SseNotesEvent.UPDATED, { note, clientId });
        eventEmitter.on('db.notes.updated', onNoteUpdated);

        const onNoteDeleted = (note: notes, clientId: string | undefined) =>
            handler(SseNotesEvent.DELETED, { note, clientId });
        eventEmitter.on('db.notes.deleted', onNoteDeleted);

        return () => {
            eventEmitter.off('db.notes.created', onNoteCreated);
            eventEmitter.off('db.notes.updated', onNoteUpdated);
            eventEmitter.off('db.notes.deleted', onNoteDeleted);
        };
    });
};
