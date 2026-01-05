<script lang="ts">
    import { useSpaceAuth } from '$lib/client/hooks/index.js';
    import { apiFetch } from '$lib/client/network';
    import {
        readSpaceDataFromStorage,
        removeSpaceDataFromStorage,
        saveSpaceToStorage,
    } from '$lib/client/utils';
    import { PasswordDialog, StaticDialogWrapper } from '$lib/components/app/dialog';
    import { Space } from '$lib/components/app/space/index.js';
    import type { CheckPasswordResponse } from '@api/spaces/password/check/+server.js';
    import { onMount } from 'svelte';
    import type { SpacePageData } from './+page.server.js';

    const { data }: { data: SpacePageData } = $props();

    const spaceAuth = useSpaceAuth();
    if (data.isAuthorized) {
        spaceAuth.setIsAuthorized(true);
    }

    let password = $state('');
    let isError = $state(false);
    let isPasswordChecking = $state(false);

    useSpaceAuth().subscribe((isAuthorized) => {
        if (isAuthorized === false) {
            removeSpaceDataFromStorage(data.spaceUid);
        }
    });

    onMount(() => {
        const key = readSpaceDataFromStorage(data.spaceUid);
        if (!key) {
            spaceAuth.setIsAuthorized(false);
        }

        if (!data.isAuthorized) {
            removeSpaceDataFromStorage(data.spaceUid);
        }
    });

    const fetchCheckPassword = async (
        password: string,
        spaceUid: string,
        save: boolean,
    ): Promise<CheckPasswordResponse | null> => {
        if (isPasswordChecking) return null;

        isPasswordChecking = true;

        try {
            const response = await apiFetch('/api/spaces/password/check', {
                method: 'POST',
                body: JSON.stringify({ password, spaceUid, save }),
            });

            isPasswordChecking = false;

            const data = (await response.json()) as CheckPasswordResponse;

            return response.status === 200 ? data : null;
        } catch (error) {
            isPasswordChecking = false;
            // TODO: Show error message

            return null;
        }
    };

    const onPasswordSubmit = async (isSave: boolean) => {
        isError = false;
        if (!password || password.length < 4) {
            isError = true;
            return;
        }

        const credits = await fetchCheckPassword(password, data.spaceUid, isSave);
        if (!credits) {
            password = '';
            isError = true;
            spaceAuth.setIsAuthorized(false);

            return;
        }

        const isSaved = saveSpaceToStorage({
            uid: data.spaceUid,
            key: credits.key,
            expiresAt: credits.expiresAt,
        });

        if (isSaved) {
            spaceAuth.setIsAuthorized(true);
        } else {
            // TODO: Show error message
            isError = true;
            spaceAuth.setIsAuthorized(false);
        }

        password = '';
    };
</script>

{#if $spaceAuth}
    <Space maxNotesCount={data.maxNotesCount} />
{:else}
    <StaticDialogWrapper>
        <PasswordDialog
            title="Unlock the space 🔐"
            description="To unlock this space, please enter the password."
            submitButtonText="Unlock"
            bind:password
            isLoading={isPasswordChecking}
            {isError}
            onSubmit={onPasswordSubmit}
        />
        <div class="mt-4 flex justify-center">
            <a class="text-sm text-muted-foreground" href="/">Create a new space</a>
        </div>
    </StaticDialogWrapper>
{/if}
