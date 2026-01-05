import { apiFetch } from '$lib/client/network';
import { decryptText, encryptText } from '$lib/client/utils/encrypt';
import { readSpaceDataFromStorage } from '$lib/client/utils/local-storage';
import type { NoteDto, NotesGetResponse } from '@api/notes/types';
import { get, writable } from 'svelte/store';

export function useNotes() {
    let notes = writable(new Map<number, NotesGetResponse['notes'][0]>());
    let isLoading = writable(false);
    let error = writable<string | null>(null);

    async function fetchNotes(spaceUid: string) {
        if (get(isLoading)) return;
        error.set(null);

        const isLoadingTimer = setTimeout(() => {
            isLoading.set(true);
        }, 150);

        try {
            const spaceData = readSpaceDataFromStorage(spaceUid);
            if (!spaceData || !spaceData.key) {
                // TODO: Throw encyption error
                clearTimeout(isLoadingTimer);
                error.set('Failed to save note');
                return;
            }

            const response = await apiFetch(`/api/notes?spaceUid=${spaceUid}`);
            if (!response.ok) {
                clearTimeout(isLoadingTimer);
                error.set('Failed to load notes');
                return;
            }

            const encryptedNotes = (await response.json()) as NotesGetResponse;
            const decryptedNotes = await Promise.all(
                encryptedNotes.notes.map(async (note) => {
                    const { iv, tag } = note;

                    return {
                        ...note,
                        content: await decryptText(note.content, spaceData.key, { iv, tag }),
                    };
                }),
            );

            clearTimeout(isLoadingTimer);

            notes.update(() => {
                return new Map(decryptedNotes.map((note) => [note.id, note]));
            });
        } catch (e) {
            error.set(e instanceof Error ? e.message : 'Failed to load notes');
        } finally {
            isLoading.set(false);
        }
    }

    async function createNote(content: string, spaceUid: string): Promise<NoteDto | undefined> {
        if (get(isLoading)) return;
        error.set(null);

        const isLoadingTimer = setTimeout(() => {
            isLoading.set(true);
        }, 150);

        try {
            const spaceData = readSpaceDataFromStorage(spaceUid);
            if (!spaceData || !spaceData.key) {
                // TODO: Throw encyption error
                clearTimeout(isLoadingTimer);
                error.set('Failed to save note');
                return;
            }

            const { encrypted, iv, tag } = await encryptText(content, spaceData.key);
            // TODO: Save iv and tag to server

            const response = await apiFetch('/api/notes/save', {
                method: 'POST',
                body: JSON.stringify({ content: encrypted, spaceUid, iv, tag }),
            });

            if (!response.ok) {
                clearTimeout(isLoadingTimer);
                error.set('Failed to save note');
                return;
            }

            clearTimeout(isLoadingTimer);

            return (await response.json()) as NoteDto;
        } catch (e) {
            error.set(e instanceof Error ? e.message : 'Failed to save note');
        } finally {
            isLoading.set(false);
        }
    }

    async function updateNote(
        noteId: number,
        content: string,
        spaceUid: string,
    ): Promise<NoteDto | undefined> {
        if (get(isLoading)) return;
        error.set(null);

        const isLoadingTimer = setTimeout(() => {
            isLoading.set(true);
        }, 150);

        try {
            const spaceData = readSpaceDataFromStorage(spaceUid);
            if (!spaceData || !spaceData.key) {
                // TODO: Throw encyption error

                clearTimeout(isLoadingTimer);
                error.set('Failed to update note');
                return;
            }

            const { encrypted, iv, tag } = await encryptText(content, spaceData.key);

            const response = await apiFetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                body: JSON.stringify({ content: encrypted, spaceUid, iv, tag }),
            });

            if (!response.ok) {
                clearTimeout(isLoadingTimer);
                error.set('Failed to update note');
                return;
            }

            clearTimeout(isLoadingTimer);

            return (await response.json()) as NoteDto;
        } catch (e) {
            error.set(e instanceof Error ? e.message : 'Failed to update note');
        } finally {
            isLoading.set(false);
        }
    }

    async function deleteNote(noteId: number) {
        if (get(isLoading)) return;
        isLoading.set(true);
        error.set(null);

        try {
            const response = await apiFetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
                body: JSON.stringify({ id: noteId }),
            });

            if (!response.ok) {
                error.set('Failed to delete note');
                return;
            }

            notes.update((currentNotes) => {
                currentNotes.delete(noteId);
                return currentNotes;
            });
        } catch (e) {
            error.set(e instanceof Error ? e.message : 'Failed to delete note');
        } finally {
            isLoading.set(false);
        }
    }

    return {
        notes,
        isLoading,
        error,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
    };
}
