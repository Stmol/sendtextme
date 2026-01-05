import { arrayBufferToBase64, base64ToArrayBuffer } from '$lib/client/utils/base64';

interface EncryptionParams {
    iv: string;
    tag: string;
}

async function importKey(base64Key: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(base64Key);

    return await window.crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, [
        'encrypt',
        'decrypt',
    ]);
}

export async function encryptText(
    text: string,
    base64Key: string,
): Promise<{ encrypted: string; tag: string; iv: string }> {
    const key = await importKey(base64Key);
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128,
        },
        key,
        data,
    );

    const encryptedArray = new Uint8Array(encrypted);
    const ciphertext = encryptedArray.slice(0, encryptedArray.length - 16);
    const tag = encryptedArray.slice(encryptedArray.length - 16);

    return {
        encrypted: arrayBufferToBase64(ciphertext),
        tag: arrayBufferToBase64(tag),
        iv: arrayBufferToBase64(iv),
    };
}

export async function decryptText(
    encryptedBase64: string,
    base64Key: string,
    params: EncryptionParams,
): Promise<string> {
    try {
        const key = await importKey(base64Key);

        const encrypted = base64ToArrayBuffer(encryptedBase64);
        const iv = base64ToArrayBuffer(params.iv);
        const tag = base64ToArrayBuffer(params.tag);

        const combined = new Uint8Array(encrypted.length + tag.length);
        combined.set(encrypted);
        combined.set(tag, encrypted.length);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128,
            },
            key,
            combined,
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Decryption failed: Invalid key or corrupted data');
    }
}
