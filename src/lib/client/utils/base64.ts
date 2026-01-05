export function arrayBufferToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export function base64ToArrayBuffer(base64: string): Uint8Array {
    const paddedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    const padding = paddedBase64.length % 4;
    const padded = padding ? paddedBase64 + '='.repeat(4 - padding) : paddedBase64;

    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}
