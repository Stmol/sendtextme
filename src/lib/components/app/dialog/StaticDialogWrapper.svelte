<script lang="ts">
    const { children } = $props();
</script>

<dialog-div>
    <div class="fixed inset-0 z-10 bg-black bg-opacity-50"></div>
    <div class="custom-modal fixed inset-0 z-20 flex items-center justify-center">
        <div class="rounded-lg bg-white p-6 shadow-lg">
            {@render children()}
        </div>
    </div>
</dialog-div>
