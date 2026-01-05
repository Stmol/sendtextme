import { nanoid } from 'nanoid';

export function generateUniqueId(length: number = 10): string {
    return nanoid(length);
}
