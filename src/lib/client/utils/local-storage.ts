import { STORAGE_SPACE_KEY } from '$lib/constants';

export interface LocalSpaceData {
    uid: string;
    key: string;
    expiresAt: string;
}

export function saveSpaceToStorage(space: LocalSpaceData): boolean {
    localStorage.setItem(`${STORAGE_SPACE_KEY}:${space.uid}`, JSON.stringify(space));

    return readSpaceDataFromStorage(space.uid) !== null;
}

export function clearExpiredDataInStorage(afterClear: () => void) {
    const storage = getAllLocalStorage();
    Object.keys(storage).forEach((key) => {
        if (key.startsWith(STORAGE_SPACE_KEY)) {
            const data = JSON.parse(storage[key] as string) as LocalSpaceData;
            if (data.expiresAt && data.expiresAt < new Date().toISOString()) {
                localStorage.removeItem(key);
                afterClear();
            }
        }
    });
}

export function removeSpaceDataFromStorage(spaceUid: string): void {
    const key = `${STORAGE_SPACE_KEY}:${spaceUid}`;
    localStorage.removeItem(key);
}

export function readSpaceDataFromStorage(spaceUid: string): LocalSpaceData | null {
    const key = `${STORAGE_SPACE_KEY}:${spaceUid}`;
    const data = localStorage.getItem(key);

    if (data) {
        const space = JSON.parse(data) as LocalSpaceData;
        if (space.expiresAt && space.expiresAt < new Date().toISOString()) {
            removeSpaceDataFromStorage(spaceUid);
            return null;
        }

        return space;
    }

    return null;
}

function getAllLocalStorage(): Record<string, string | null> {
    const storage: Record<string, string | null> = {};
    const keys = Object.keys(localStorage);
    let i = keys.length;

    while (i--) {
        storage[keys[i]] = localStorage.getItem(keys[i]);
    }

    return storage;
}
