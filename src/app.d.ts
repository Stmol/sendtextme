// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        interface Error {
            message: string;
            code: number;
            info?: Record<string, any>;
        }
        interface Locals {
            session: import('@prisma/client').sessions;
            spacesAccess: import('$lib/server/security').SpaceAccess[];
            // Random value generated on the client
            // and sent to the server in headers
            // to identify the client across different browser tabs
            clientId?: string;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
