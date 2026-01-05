<script lang="ts">
    import { page } from '$app/state';
</script>

<h1>{page.error?.code} {page.error?.message}</h1>
