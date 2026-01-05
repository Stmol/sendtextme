import crypto from 'crypto';

const KEY_LENGTH = 32;
const ITERATIONS = 5;

export type EncryptedKey = {
    key: string;
    salt: string;
    iterations: number;
}

export function generateEncryptionKey(password: string, salt?: string): EncryptedKey {
    const usedSalt = salt ? Buffer.from(salt, 'base64') : crypto.randomBytes(16);

    const key = crypto.pbkdf2Sync(
        password,
        usedSalt,
        ITERATIONS,
        KEY_LENGTH,
        'sha256'
    );

    return {
        key: key.toString('base64'),
        salt: usedSalt.toString('base64'),
        iterations: ITERATIONS
    };
}
