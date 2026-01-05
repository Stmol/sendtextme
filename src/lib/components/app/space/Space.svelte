<script lang="ts">
    import { page } from '$app/state';
    import { useNotes } from '$lib/client/hooks';
    import { useDialog } from '$lib/client/hooks/dialog';
    import { clientId } from '$lib/client/network';
    import { relativeDate, removeSpaceDataFromStorage } from '$lib/client/utils';
    import { LoadingButton } from '$lib/components/app/button';
    import {
        DeleteNote,
        DeleteSpace,
        DiscardNoteChanges,
        LogoutProgress,
        ShareSpace,
    } from '$lib/components/app/dialog';
    import { SpaceSkeleton } from '$lib/components/app/space';
    import { Button } from '$lib/components/ui';
    import { useGlobalToast } from '$lib/stores/toast';
    import {
        KeyRound,
        Lock,
        LockOpen,
        Menu,
        PanelRightOpen,
        Plus,
        Share2,
        Trash,
        UserRoundX,
    } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { source } from 'sveltekit-sse';
    import { SseNotesEvent } from '../../../../routes/sse/notes/types';
    import { slideHorizontal } from './transitions';

    const { maxNotesCount }: { maxNotesCount: number } = $props();

    const spaceUid = page.params.uid;
    const sseOptions = {
        headers: {
            'x-space-uid': spaceUid,
            'x-client-id': clientId,
        },
    };

    // Hooks

    const { showError, showSuccess } = useGlobalToast();
    const { showDialog, closeDialog, setInteractible } = useDialog();
    const {
        notes,
        isLoading: isNotesLoading,
        error: notesError,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
    } = useNotes();

    // Local state

    let initialLoading = $state(true);
    let isCreatingNote = $state(false);
    let textareaContent = $state('');
    let selectedNoteOriginalContent = $state('');
    let isDropdownOpen = $state(false);
    let hideBorderForLastItem = $state(false);
    let isNotesListVisible = $state(true);

    // Derived

    const showSkeleton = $derived.by(() => initialLoading && $isNotesLoading);

    const MAX_NOTE_LENGTH = 7500;

    const isSaveButtonDisabled = $derived.by(
        () =>
            textareaContent.trim() === '' ||
            editedNoteContent === selectedNoteOriginalContent ||
            textareaContent.length > MAX_NOTE_LENGTH,
    );

    const editedNoteContent: string | null = $derived.by(() => {
        return selectedNoteId === null ? null : textareaContent;
    });

    const isSelectedNoteWasChanged = $derived(textareaContent !== selectedNoteOriginalContent);

    const selectedNoteId: number | null = $derived.by(() => {
        const id = Number(page.url.hash.replace('#', ''));

        if (!id || !$notes.get(id)) {
            return null;
        }

        return id;
    });

    const isCreateNoteButtonDisabled = $derived.by(() => {
        return $notes.size >= maxNotesCount;
    });

    const characterCount = $derived.by(() => textareaContent.length);

    // Subscribers

    // notes.subscribe(() => {
    //     checkNotesOverflow();
    // });

    notesError.subscribe((error) => {
        if (error) {
            showError(error);
        }
    });

    onMount(() => {
        fetchNotes(spaceUid);

        const sseNoteCreatedSubscription = source('/sse/notes', { options: sseOptions })
            .select(SseNotesEvent.CREATED)
            .subscribe(onSseNoteEventHandler);

        const sseNoteUpdatedSubscription = source('/sse/notes', { options: sseOptions })
            .select(SseNotesEvent.UPDATED)
            .subscribe(onSseNoteEventHandler);

        const sseNoteDeletedSubscription = source('/sse/notes', { options: sseOptions })
            .select(SseNotesEvent.DELETED)
            .subscribe(onSseNoteEventHandler);

        initialLoading = false;

        return () => {
            sseNoteCreatedSubscription?.();
            sseNoteUpdatedSubscription?.();
            sseNoteDeletedSubscription?.();
        };
    });

    $effect(() => {
        if (selectedNoteId !== null) {
            const noteContent = $notes.get(selectedNoteId)?.content ?? '';
            textareaContent = noteContent;
            selectedNoteOriginalContent = noteContent;

            isCreatingNote = false;
        }
    });

    // function checkNotesOverflow() {
    //     if (notesListContainer) {
    //         console.log(notesListContainer.scrollHeight, notesListContainer.clientHeight);
    //         hideBorderForLastItem =
    //             notesListContainer.scrollHeight > notesListContainer.clientHeight;
    //     }
    // }

    async function onNoteSaveButtonClick() {
        if ($isNotesLoading) {
            return;
        }

        const trimmedContent = textareaContent.trim();
        if (!trimmedContent) {
            showError('Content cannot be empty');
            return;
        }

        if (trimmedContent.length > MAX_NOTE_LENGTH) {
            showError(`Content cannot exceed ${MAX_NOTE_LENGTH} characters`);
            return;
        }

        let note;
        if (selectedNoteId === null) {
            note = await createNote(trimmedContent, spaceUid);
            if (note) {
                window.location.hash = `#${note.id}`;
            }
        } else {
            note = await updateNote(selectedNoteId, trimmedContent, spaceUid);
        }

        if (!note) return;

        isCreatingNote = false;
        showSuccess('Note saved');
        await fetchNotes(spaceUid);
    }

    function onNoteClick(id: number) {
        if (selectedNoteId === id) {
            isNotesListVisible = false;
            return;
        }

        if (isSelectedNoteWasChanged) {
            showDialog({
                component: DiscardNoteChanges,
                isDismissable: false,
                componentProps: {
                    onDiscard: () => {
                        isNotesListVisible = false;
                        window.location.hash = `#${id}`;
                        closeDialog();
                    },
                    onCancel: () => {
                        closeDialog();
                    },
                },
            });
        } else {
            isNotesListVisible = false;
            window.location.hash = `#${id}`;
        }
    }

    function onNoteCreateButtonClick() {
        isNotesListVisible = false;
        const textareaElements = document.querySelectorAll('textarea');
        textareaElements.forEach((element) => {
            element.focus();
        });

        if (isCreatingNote) return;

        window.location.hash = '';
        isCreatingNote = true;
        textareaContent = '';
        selectedNoteOriginalContent = '';
    }

    function onTextareaFocus() {
        if (selectedNoteId) return;
        isCreatingNote = true;
    }

    function onShowNotesListButtonClick() {
        isNotesListVisible = true;
    }

    async function onNoteDeleteButtonClick() {
        if (!selectedNoteId || $isNotesLoading) {
            return;
        }

        showDialog({
            component: DeleteNote,
            isDismissable: true,
            componentProps: {
                onActionButtonClick: async () => {
                    setInteractible(false);

                    await deleteNote(selectedNoteId);

                    isNotesListVisible = true;
                    window.location.hash = '';
                    textareaContent = '';
                    selectedNoteOriginalContent = '';

                    setInteractible(true);

                    closeDialog();
                },
                onCancel: closeDialog,
            },
        });
    }

    function onSseNoteEventHandler(data: string | undefined) {
        if (!data) return;

        const [client] = data.split(';');
        if (client && client === clientId) return;

        fetchNotes(spaceUid);
    }

    function toggleDropdownMenu() {
        isDropdownOpen = !isDropdownOpen;
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
            isDropdownOpen = false;
        }
    }

    function onCopyButtonClick() {
        if (!textareaContent) return;
        navigator.clipboard.writeText(textareaContent);
        showSuccess('Copied to clipboard');
    }

    async function onLogoutButtonClick() {
        const dialogTimer = setTimeout(() => {
            showDialog({
                component: LogoutProgress,
                isDismissable: false,
                componentProps: {
                    urlToRefresh: `/s/${spaceUid}`,
                },
            });
        }, 350);

        const response = await fetch('/api/spaces/logout', {
            method: 'POST',
            body: JSON.stringify({ spaceUid }),
        });

        if (response.ok) {
            clearTimeout(dialogTimer);
            removeSpaceDataFromStorage(spaceUid);
            window.location.href = `/s/${spaceUid}`;
            return;
        }

        closeDialog(() => {
            showError('Failed to logout');
        });
    }

    async function onDeleteSpaceButtonClick() {
        isDropdownOpen = false;

        showDialog({
            component: DeleteSpace,
            isDismissable: true,
            componentProps: {
                onActionButtonClick: async () => {
                    setInteractible(false);

                    const response = await fetch('/api/spaces', {
                        method: 'DELETE',
                        body: JSON.stringify({ spaceUid }),
                    });

                    if (response.ok) {
                        removeSpaceDataFromStorage(spaceUid);
                        window.location.href = '/';
                        return;
                    }

                    setInteractible(true);
                    showError('Failed to delete space');
                },
                onCancel: closeDialog,
            },
        });
    }

    function onChangePasswordButtonClick() {}

    function onShareSpaceButtonClick() {
        isDropdownOpen = false;

        showDialog({
            component: ShareSpace,
            isDismissable: true,
            componentProps: {
                onActionButtonClick: () => {
                    const urlWithoutHash = window.location.href.split('#')[0];
                    navigator.clipboard.writeText(urlWithoutHash);
                    closeDialog(() => {
                        showSuccess('Link copied to clipboard');
                    });
                },
                onCancel: closeDialog,
            },
        });
    }
</script>

<!-- Add click outside handler to the root element -->
<svelte:window onclick={handleClickOutside} />

{#if showSkeleton}
    <SpaceSkeleton />
{:else}
    <!-- 🖥️ Desktop layout -->
    <div class="relative mx-auto hidden h-screen max-w-screen-lg p-2 md:block">
        <!-- 📑 Grid layout container with border -->
        <div class="grid h-full grid-cols-[3fr_1fr] grid-rows-[60px_1fr] rounded-lg border-[1.5px]">
            <!-- 🎯 Top row - left column -->
            <div class="rounded-tl-lg border-b-[1.5px] border-r-[1.5px] bg-zinc-50">
                <!-- 🎛️ Controls container -->
                <div class="flex h-full flex-row items-center justify-between px-3.5">
                    <!-- 💾 Save button group -->
                    <LoadingButton
                        title="save"
                        showLoader={$isNotesLoading}
                        isDisabled={isSaveButtonDisabled}
                        onClick={onNoteSaveButtonClick}
                        class="h-9 w-20 items-center"
                        variant="outline"
                    />

                    <!-- 📊 Character count -->
                    <p
                        class="font-mono text-xs"
                        class:text-zinc-500={characterCount < MAX_NOTE_LENGTH}
                        class:text-red-500={characterCount >= MAX_NOTE_LENGTH}
                    >
                        {characterCount}/{MAX_NOTE_LENGTH}
                    </p>

                    <!-- 🛠️ Action buttons group -->
                    <div class="flex space-x-2">
                        <!-- 📋 Copy button -->
                        <Button
                            variant="outline"
                            class="h-9 items-stretch uppercase"
                            onclick={onCopyButtonClick}>copy</Button
                        >
                        <!-- 🗑️ Delete button -->
                        <Button
                            variant="outline"
                            size="icon"
                            onclick={onNoteDeleteButtonClick}
                            disabled={!selectedNoteId || $isNotesLoading}
                        >
                            <Trash />
                        </Button>
                    </div>
                </div>
            </div>

            <!-- 📊 Top row - right column -->
            <div class="rounded-tr-lg border-b-[1.5px] bg-zinc-50">
                <!-- 🎮 Controls container -->
                <div
                    class="dropdown-container relative mx-3.5 flex h-full flex-row items-center justify-between"
                >
                    <!-- ➕ Create note button -->
                    <Button
                        variant="outline"
                        size="icon"
                        onclick={onNoteCreateButtonClick}
                        disabled={isCreateNoteButtonDisabled}
                    >
                        <Plus />
                    </Button>

                    <!-- 📈 Notes count -->
                    <div class="flex flex-col items-center">
                        <span class="text-sm font-medium">Notes</span>
                        <span class="font-mono text-xs text-zinc-500"
                            >{$notes.size}/{maxNotesCount}</span
                        >
                    </div>

                    <!-- 📝 Dropdown menu -->
                    <Button
                        variant="outline"
                        size="icon"
                        onclick={toggleDropdownMenu}
                        class={isDropdownOpen ? 'bg-gray-100' : ''}
                    >
                        <Menu />
                    </Button>

                    <!-- 🔽 Dropdown content -->
                    {#if isDropdownOpen}
                        <div
                            class="absolute right-0 top-14 z-10 hidden w-full rounded-md border bg-white py-1 shadow-lg md:block"
                            transition:fade={{ duration: 100 }}
                        >
                            {@render dropdown()}
                        </div>
                    {/if}
                </div>
            </div>

            <!-- 📝 Left column for note editing -->
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
    <div class="relative h-dvh md:hidden">
        <!-- ✏️ Editor View -->
        <div class="flex h-full flex-col">
            <!-- 📄 Content Area -->
            <div class="flex-1">
                {@render editor()}
            </div>

            <!-- 🎛️ Bottom Menu for Editor -->
            <div class="border-t-[1.5px] bg-zinc-50 p-3.5">
                <!-- 🎮 Controls container -->
                <div class="flex items-center justify-between">
                    <!-- 🛠️ Left side controls -->
                    <div class="flex space-x-2">
                        <!-- 💾 Save and copy buttons -->
                        <div class="flex space-x-2">
                            <LoadingButton
                                title="save"
                                showLoader={$isNotesLoading}
                                isDisabled={isSaveButtonDisabled}
                                onClick={onNoteSaveButtonClick}
                                class="h-9 w-20 items-center"
                                variant="outline"
                            />
                            <Button
                                variant="outline"
                                class="h-9 items-stretch uppercase"
                                onclick={onCopyButtonClick}
                                >copy
                            </Button>
                        </div>
                        <!-- 🗑️ Delete button -->
                        <Button
                            variant="outline"
                            size="icon"
                            onclick={onNoteDeleteButtonClick}
                            disabled={!selectedNoteId || isCreatingNote}
                        >
                            <Trash />
                        </Button>
                    </div>
                    <!-- 📊 Character count -->
                    <p
                        class="flex h-9 items-center font-mono text-xs"
                        class:text-zinc-500={characterCount < MAX_NOTE_LENGTH}
                        class:text-red-500={characterCount >= MAX_NOTE_LENGTH}
                    >
                        {characterCount}/{MAX_NOTE_LENGTH}
                    </p>
                    <!-- 📋 Notes list toggle -->
                    <Button variant="outline" size="icon" onclick={onShowNotesListButtonClick}>
                        <PanelRightOpen />
                    </Button>
                </div>
            </div>
        </div>

        <!-- 📝 Notes List View -->
        {#if isNotesListVisible}
            <div
                class="absolute inset-0 flex h-full flex-col bg-white"
                transition:slideHorizontal={{
                    delay: 0,
                    duration: 200,
                    // onTransitionEnd: () => {
                    //     checkNotesOverflow();
                    // },
                }}
            >
                <!-- 📜 Notes List container -->
                <div class="flex-1 overflow-hidden">
                    {@render notesList()}
                </div>

                <!-- 🎛️ Bottom Menu for Notes List -->
                <div class="border-t-[1.5px] bg-zinc-50 p-3.5">
                    <!-- 🎮 Controls container -->
                    <div class="flex items-center justify-between">
                        <!-- ➕ Create note button -->
                        <Button
                            variant="outline"
                            size="icon"
                            onclick={onNoteCreateButtonClick}
                            disabled={isCreateNoteButtonDisabled}
                        >
                            <Plus />
                        </Button>

                        <!-- 📈 Notes count -->
                        <div class="flex flex-col items-center">
                            <span class="text-sm font-medium">Notes</span>
                            <span class="font-mono text-xs text-zinc-500"
                                >{$notes.size}/{maxNotesCount}</span
                            >
                        </div>

                        <!-- 📝 Dropdown menu container -->
                        <div class="dropdown-container relative">
                            <Button variant="outline" size="icon" onclick={toggleDropdownMenu}>
                                <Menu />
                            </Button>

                            <!-- 🔽 Dropdown content -->
                            {#if isDropdownOpen}
                                <div
                                    class="absolute bottom-full right-0 mb-2 w-48 rounded-lg border bg-white py-1 shadow-lg"
                                    transition:fade={{ duration: 100 }}
                                >
                                    {@render dropdown()}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
{/if}

{#snippet dropdown()}
    <!-- 🔗 Share space button -->
    <button
        class="flex w-full items-center space-x-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
        onclick={onShareSpaceButtonClick}
    >
        <Share2 size={16} strokeWidth={2} />
        <small class="text-sm font-medium leading-none">Share space</small>
    </button>
    <!-- 🔑 Change password button -->
    <button
        class="pointer-events-none flex w-full items-center space-x-2 px-4 py-3 text-sm text-gray-400"
        onclick={onChangePasswordButtonClick}
    >
        <KeyRound size={16} strokeWidth={2} />
        <small class="text-nowrap text-sm font-medium leading-none">Change password</small>
    </button>

    <!-- 👤 Logout button -->
    <button
        class="flex w-full items-center space-x-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
        onclick={onLogoutButtonClick}
    >
        <UserRoundX size={16} strokeWidth={2} />
        <small class="text-sm font-medium leading-none">Logout</small>
    </button>
    <!-- ➖ Divider -->
    <div class="my-1 h-px bg-gray-200"></div>
    <!-- 🗑️ Delete space button -->
    <button
        class="flex w-full items-center space-x-2 px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
        onclick={onDeleteSpaceButtonClick}
    >
        <Trash size={16} strokeWidth={2} />
        <small class="text-sm font-medium leading-none">Delete space</small>
    </button>
{/snippet}

{#snippet editor()}
    <textarea
        class="h-full w-full flex-1 resize-none border-none bg-transparent p-3.5 outline-none focus:outline-none focus:ring-0"
        bind:value={textareaContent}
        onfocus={onTextareaFocus}
        maxlength={MAX_NOTE_LENGTH}
    ></textarea>
{/snippet}

{#snippet notesList()}
    <!-- 📜 Scrollable notes list container -->
    <div class="relative h-full overflow-y-auto overflow-x-hidden">
        <!-- 📌 New note item -->
        {#if isCreatingNote}
            <div
                class=" cursor-pointer border-b-[1.5px] border-gray-200 p-4 py-6 hover:bg-zinc-100"
                onclick={onNoteCreateButtonClick}
            >
                <!-- 📄 Draft content preview -->
                <p class="line-clamp-3 overflow-hidden text-ellipsis text-sm text-zinc-600">
                    {#if textareaContent}
                        {textareaContent}
                    {:else}
                        <span class="italic">Empty note...</span>
                    {/if}
                </p>
                <!-- ⏰ Draft metadata -->
                <div class="mt-4 flex flex-row items-center">
                    <LockOpen size={12} strokeWidth={2} class="mr-1 text-red-600" />
                    <p class="text-xs text-red-500">Unsaved note</p>
                </div>
            </div>
        {/if}

        {#each Array.from($notes.values()) as note, _ (note.id)}
            <!-- 📌 Individual note item -->
            <div
                class="relative cursor-pointer border-gray-200 p-4 py-5 hover:bg-zinc-100"
                style:border-bottom-width={'1.5px'}
                onclick={() => onNoteClick(note.id)}
            >
                <!-- 📄 Note content preview -->
                <p class="line-clamp-3 overflow-hidden text-ellipsis text-sm text-zinc-600">
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
                {#if note.id === selectedNoteId}
                    <div class="absolute inset-0 w-1 bg-zinc-700 md:w-0.5"></div>
                {/if}
            </div>
        {/each}
    </div>
{/snippet}

<style>
    /* Text Ellipsis Styles */
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; /* Number of lines to show */
        line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 3em; /* Adjust the height to fit 3 lines of text */
        line-height: 1.5em; /* Adjust the line height to fit the text */
    }
</style>
