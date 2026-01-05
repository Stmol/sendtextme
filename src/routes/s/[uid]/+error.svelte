<script lang="ts">
    import { page } from '$app/state';

    const error = page.error;
    const spaceUid = page.params.uid as string;
</script>

<!-- TODO: Add error layout -->
<h1>Something went wrong <a href="/">Go back to home</a></h1>
