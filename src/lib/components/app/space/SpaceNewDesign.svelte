<script lang="ts">
    import { relativeDate } from '$lib/client/utils';
    import { LoadingButton } from '$lib/components/app/button';
    import { Button } from '$lib/components/ui';
    import { Lock, LockOpen, Menu, PanelRightOpen, Plus, Trash } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { linear } from 'svelte/easing';
    import { writable } from 'svelte/store';

    const notes = writable(
        Array.from({ length: 16 }, (_, i) => ({
            id: i + 1,
            content: `This is note ${i + 1} with some random content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
            iv: crypto.getRandomValues(new Uint8Array(12)),
            tag: crypto.getRandomValues(new Uint8Array(16)),
        })),
    );

    let notesListContainer: HTMLDivElement;
    let hideBorderForLastItem = false;

    const checkOverflow = () => {
        if (notesListContainer) {
            hideBorderForLastItem =
                notesListContainer.scrollHeight > notesListContainer.clientHeight;
        }
    };

    notes.subscribe(() => {
        checkOverflow();
    });

    function slideHorizontal(node: HTMLElement, { delay = 0, duration = 200 }) {
        return {
            delay,
            duration,
            css: (t: number) => {
                const eased = linear(t);
                return `transform: translateX(${(1 - eased) * 100}%);`;
            },
            tick: (t: number) => {
                if (t === 1) {
                    checkOverflow();
                }
            },
        };
    }

    onMount(() => {
        checkOverflow();
    });

    // Mobile view state
    const isNotesListVisible = writable(false);

    // Handle note selection
    const handleNoteSelect = () => {
        isNotesListVisible.set(false);
    };

    // Handle show notes list
    const handleShowNotesList = () => {
        isNotesListVisible.set(true);
    };

    // Handle note deletion
    const handleDelete = () => {
        notes.update((currentNotes) => currentNotes.slice(0, -1));
    };

    const isMenuOpen = writable(false);

    const handleMenuClick = () => {
        isMenuOpen.set(!$isMenuOpen);
    };
</script>

{#snippet editor()}
    <textarea
        class="h-full w-full resize-none border-none bg-transparent p-3.5 outline-none focus:outline-none focus:ring-0"
        >{`${Array(100)
            .fill(
                `This is note 1 with some random content. Lorem ipsum dolor sit amet, consectetur
adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
aliqua.`,
            )
            .join('\n')}`.trim()}</textarea
    >
{/snippet}

{#snippet notesList()}
    <!-- 📜 Scrollable notes list container -->
    <div bind:this={notesListContainer} class="relative h-full overflow-y-auto overflow-x-hidden">
        <!-- 📌 New note item -->
        <div class=" cursor-pointer border-b-[1.5px] border-gray-200 p-4 py-6 hover:bg-zinc-100">
            <!-- 📄 Draft content preview -->
            <p class="line-clamp-3 overflow-hidden text-ellipsis text-zinc-600">New note...</p>
            <!-- ⏰ Draft metadata -->
            <div class="mt-4 flex flex-row items-center">
                <LockOpen size={12} strokeWidth={2} class="mr-1 text-red-600" />
                <p class="text-xs text-red-500">Unsaved note</p>
            </div>
        </div>

        {#each $notes as note, index}
            <!-- 📌 Individual note item -->
            <div
                class="relative cursor-pointer border-gray-200 p-4 py-5 hover:bg-zinc-100"
                style:border-bottom-width={hideBorderForLastItem && index === $notes.length - 1
                    ? '0'
                    : '1.5px'}
            >
                <!-- 📄 Note content preview -->
                <p class="line-clamp-3 overflow-hidden text-ellipsis text-zinc-600">
                    {note.content}
                </p>
                <!-- ⏰ Note metadata -->
                <div class="mt-4 flex flex-row items-center">
                    <Lock size={12} strokeWidth={2} class="mr-1 text-green-600" />
                    <p class="text-xs text-zinc-500">
                        {relativeDate(new Date(note.updatedAt))}
                    </p>
                </div>

                <!-- 🔍 Active note indicator -->
                {#if index === 2}
                    <div class="absolute inset-0 w-1 bg-zinc-500"></div>
                {/if}
            </div>
        {/each}
    </div>
{/snippet}

<!-- 🖥️ Desktop layout -->
<div class="relative mx-auto hidden h-screen max-w-screen-lg p-2 md:block">
    <!-- 📑 Grid layout container with border -->
    <div class="grid h-full grid-cols-[3fr_1fr] grid-rows-[60px_1fr] rounded-lg border-[1.5px]">
        <!-- Top row - left column -->
        <div class="rounded-tl-lg border-b-[1.5px] border-r-[1.5px] bg-zinc-50">
            <div class="flex h-full flex-row items-center justify-between px-3.5">
                <!-- 💾 Save button group -->
                <LoadingButton
                    title="save"
                    showLoader={false}
                    isDisabled={false}
                    onClick={() => {}}
                    class="h-9 w-20 items-center"
                    variant="outline"
                />
                <!-- 🛠️ Action buttons group -->
                <div class="flex space-x-2">
                    <Button variant="outline" class="h-9 items-stretch uppercase">copy</Button>
                    <Button variant="outline" size="icon" onclick={handleDelete}>
                        <Trash />
                    </Button>
                </div>
            </div>
        </div>

        <!-- Top row - right column -->
        <div class="rounded-tr-lg border-b-[1.5px] bg-zinc-50">
            <div class="flex h-full flex-row items-center justify-between px-3.5">
                <!-- Create note button -->
                <Button variant="outline" size="icon">
                    <Plus />
                </Button>

                <!-- Notes count -->
                <div class="flex flex-col items-center">
                    <span class="text-sm font-medium">Notes</span>
                    <span class="font-mono text-xs text-zinc-500">5/10</span>
                </div>

                <!-- Dropdown menu -->
                <div class="relative">
                    <Button variant="outline" size="icon" onclick={handleMenuClick}>
                        <Menu />
                    </Button>

                    {#if $isMenuOpen}
                        <div
                            class="absolute bottom-full right-0 mb-2 w-48 rounded-lg border bg-white py-1 shadow-lg"
                        >
                            <button
                                class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onclick={() => {
                                    isMenuOpen.set(false);
                                    isNotesListVisible.set(false);
                                }}
                            >
                                Back to Editor
                            </button>
                            <button
                                class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Settings
                            </button>
                            <button
                                class="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                            >
                                Delete Note
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Left column for note editing -->
        <div class="border-r-[1.5px] border-gray-200">
            {@render editor()}
        </div>

        <!-- 📋 Right column for notes list -->
        <div class="flex flex-col overflow-hidden rounded-br-md rounded-tr-md bg-zinc-50">
            {@render notesList()}
        </div>
    </div>
</div>

<!-- 📱 Mobile layout -->
<div class="relative h-screen md:hidden">
    <!-- Editor View -->
    <div class="flex h-full flex-col">
        <!-- Content Area -->
        <div class="flex-1">
            {@render editor()}
        </div>

        <!-- Bottom Menu for Editor -->
        <div class="border-t-[1.5px] bg-zinc-50 p-3.5">
            <div class="flex items-center justify-between">
                <div class="flex space-x-2">
                    <div class="flex space-x-2">
                        <LoadingButton
                            title="save"
                            showLoader={false}
                            isDisabled={false}
                            onClick={() => {}}
                            class="h-9 w-20 items-center"
                            variant="outline"
                        />
                        <Button variant="outline" class="h-9 items-stretch uppercase">copy</Button>
                    </div>
                    <Button variant="outline" size="icon" onclick={handleDelete}>
                        <Trash />
                    </Button>
                </div>
                <Button variant="outline" size="icon" onclick={handleShowNotesList}>
                    <PanelRightOpen />
                </Button>
            </div>
        </div>
    </div>

    <!-- Notes List View -->
    {#if $isNotesListVisible}
        <div
            class="absolute inset-0 flex h-full flex-col bg-white"
            transition:slideHorizontal={{ delay: 100, duration: 200 }}
        >
            <!-- Notes List container with flex-1 to take remaining space -->
            <div class="flex-1 overflow-hidden">
                {@render notesList()}
            </div>

            <!-- Bottom Menu for Notes List -->
            <div class="border-t-[1.5px] bg-zinc-50 p-3.5">
                <div class="flex items-center justify-between">
                    <Button variant="outline" size="icon">
                        <Plus />
                    </Button>

                    <!-- Notes count -->
                    <div class="flex flex-col items-center">
                        <span class="text-sm font-medium">Notes</span>
                        <span class="font-mono text-xs text-zinc-500">5/10</span>
                    </div>

                    <div class="relative">
                        <Button variant="outline" size="icon" onclick={handleMenuClick}>
                            <Menu />
                        </Button>

                        {#if $isMenuOpen}
                            <div
                                class="absolute bottom-full right-0 mb-2 w-48 rounded-lg border bg-white py-1 shadow-lg"
                            >
                                <button
                                    class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    onclick={() => {
                                        isMenuOpen.set(false);
                                        isNotesListVisible.set(false);
                                    }}
                                >
                                    Back to Editor
                                </button>
                                <button
                                    class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Settings
                                </button>
                                <button
                                    class="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Delete Note
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Text Ellipsis Styles */
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3; /* Number of lines to show */
        line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 3.6em; /* Adjust the height to fit 3 lines of text */
        line-height: 1.2em; /* Adjust the line height to fit the text */
    }
</style>
