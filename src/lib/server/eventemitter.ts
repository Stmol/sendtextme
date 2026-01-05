import type { notes } from '@prisma/client';
import EventEmitter from 'node:events';

export type EventsMap = {
    'db.notes.created': [notes, string | undefined];
    'db.notes.updated': [notes, string | undefined];
    'db.notes.deleted': [notes, string | undefined];
};

const eventEmitter = new EventEmitter<EventsMap>();

export default eventEmitter;
