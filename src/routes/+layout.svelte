<script lang="ts">
    import { Dialog } from '$lib/components/app/dialog';
    import { Guard } from '$lib/components/app/guard';
    import { Toast } from '$lib/components/app/toast';
    import '../app.css';

    const { children } = $props();
</script>

<Guard>
    <Toast />
    {@render children()}

    <!-- This is a shared SPA dialog layout. Its used to show dialogs from store -->
    <Dialog />
</Guard>
