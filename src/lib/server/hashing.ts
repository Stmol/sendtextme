import bcrypt from 'bcrypt';

const SALT_ROUNDS = 8;

export async function hashPassword(rawPassword: string): Promise<string> {
    return bcrypt.hash(rawPassword, SALT_ROUNDS);
}

export async function verifyPassword(
    rawPassword: string,
    hashedPassword: string,
): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword);
}
