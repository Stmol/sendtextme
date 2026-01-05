<script lang="ts">
    import { LoadingButton } from '$lib/components/app/button';
    import type { PasswordDialogProps } from '$lib/components/app/dialog/types';
    import { Button, Checkbox, Input, Label } from '$lib/components/ui';
    import { LoaderCircle } from 'lucide-svelte';

    let {
        password = $bindable(),
        title = 'New space 🔭',
        description = 'To create a new space, enter a password',
        checkboxTitle = 'Save the password for 5 days',
        submitButtonText = 'Create',
        isLoading = false,
        isError = false,
        onSubmit,
    }: PasswordDialogProps = $props();

    let isChecked = $state(false);
</script>

<h2 class="text-2xl font-semibold tracking-tight">{title}</h2>
<p class="mt-2 text-sm font-medium leading-none text-muted-foreground">{description}</p>

<Input
    oninput={() => (isError = false)}
    type="password"
    placeholder="Password"
    class="my-4 {isError ? 'border-red-500' : ''}"
    bind:value={password}
/>

{#if checkboxTitle}
    <div class="mb-4 flex items-center space-x-2">
        <Checkbox id="save-password" title={checkboxTitle} bind:checked={isChecked} />
        <Label for="save-password" class="cursor-pointer">{checkboxTitle}</Label>
    </div>
{/if}

<LoadingButton
    title={submitButtonText}
    showLoader={isLoading}
    onClick={() => onSubmit(isChecked)}
    class="w-full"
/>
