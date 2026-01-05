<script lang="ts">
    import { goto } from '$app/navigation';
    import { apiFetch } from '$lib/client/network';
    import { saveSpaceToStorage } from '$lib/client/utils/local-storage';
    import { StaticDialogWrapper, PasswordDialog } from '$lib/components/app/dialog';
    import type { CreateSpaceRequest, SpacesPostResponse } from './api/spaces/types';

    let isError = $state(false);
    let isLoading = $state(false);
    let password = $state('');

    const onSubmit = async (isSave: boolean) => {
        isError = false;

        if (password.length < 4) {
            isError = true;
            return;
        }

        isLoading = true;

        const response = await apiFetch('/api/spaces', {
            method: 'POST',
            body: JSON.stringify({ password, save: isSave } satisfies CreateSpaceRequest),
        });

        if (response.status !== 200) {
            isError = true;
            isLoading = false;
            // TODO: show error message
            return;
        }

        const space = (await response.json()) as SpacesPostResponse;
        const url = `/s/${space.uid}`;

        const isSaved = saveSpaceToStorage(space);
        if (!isSaved) {
            // TODO: Show error message
            isError = true;
            isLoading = false;
            return;
        }

        isLoading = false;

        await goto(url);
    };
</script>

<StaticDialogWrapper>
    <PasswordDialog {onSubmit} {isError} {isLoading} bind:password />
</StaticDialogWrapper>
