import { linear } from 'svelte/easing';

export function slideHorizontal(
    node: HTMLElement,
    {
        delay = 0,
        duration = 200,
        onTransitionEnd,
    }: { delay?: number; duration?: number; onTransitionEnd?: () => void },
) {
    return {
        delay,
        duration,
        css: (t: number) => {
            const eased = linear(t);
            return `transform: translateX(${(1 - eased) * 100}%);`;
        },
        tick: (t: number) => {
            if (t === 1) {
                onTransitionEnd?.();
            }
        },
    };
}
