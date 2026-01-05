<script lang="ts">
    import { Skeleton } from '$lib/components/ui';
</script>

<div class="relative mx-auto grid h-screen max-w-screen-lg grid-cols-1 md:grid-cols-[1fr_250px]">
    <!-- Left panel -->
    <div class="p-4" style="height: 100vh;">
        <Skeleton class="mb-2 h-16 w-full" />
        <Skeleton class="mb-2 h-[calc(100vh-6rem)] w-full" />
    </div>

    <!-- Right panel -->
    <div class="hidden overflow-y-auto border-l border-gray-200 bg-white p-4 md:block">
        <ul>
            {#each Array(7) as _}
                <li>
                    <Skeleton class="mb-2 h-16 w-full" />
                    <Skeleton class="mb-4 h-3 w-2/3" />
                </li>
            {/each}
        </ul>
    </div>
</div>
