import type { RequestEvent } from '@sveltejs/kit';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create a rate limiter instance
export const limiter = new RateLimiterMemory({
    points: 15, // Number of points
    duration: 20, // Per 20 seconds
    blockDuration: 30, // Block for 20 seconds if exceeded
});

export async function rateLimiterHook(event: RequestEvent) {
    try {
        const ip = event.getClientAddress();
        await limiter.consume(ip);

        return null;
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: 'Too many requests. Please try again later.',
                status: 429,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
