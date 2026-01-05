import type { notes } from '@prisma/client';

export type NoteDto = Pick<notes, 'id' | 'uid' | 'content' | 'updatedAt'> & {
    iv: string;
    tag: string;
};

export type NotesGetRequest = {
    spaceUid: string;
};

export type NotesGetResponse = {
    notes: NoteDto[];
};

export type SaveNoteRequest = {
    content: string;
    spaceUid: string;
    iv: string;
    tag: string;
};

export type UpdateNoteRequest = {
    content: string;
    iv: string;
    tag: string;
    spaceUid: string;
};

export type UpdateNoteResponse = NoteDto;

export type DeleteNoteRequest = {
    id: number;
};

export type DeleteNoteResponse = {
    id: number;
};