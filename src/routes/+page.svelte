<script lang="ts">
    import { onMount } from 'svelte';
    import { initDB, getItems, addItem, completeItem } from '$lib/db';
    // ... imports de UI
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";

    let items = $state<any[]>([]);
    let newItem = $state('');
    let loading = $state(true);

    onMount(async () => {
        await initDB();
        await refresh(); // Ahora es async
        loading = false;
    });

    async function refresh() {
        items = await getItems(); // Await obligatorio
    }

    async function handleAdd() {
        if (!newItem) return;
        await addItem(newItem); // Await obligatorio
        newItem = '';
        await refresh();
    }

    async function handleComplete(id: number) {
        await completeItem(id); // Await obligatorio
        await refresh();
    }
</script>

<div class="p-8 max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Backlog Local</h1>
    
    <div class="flex gap-2">
        <Input bind:value={newItem} placeholder="Nueva tarea..." />
        <Button onclick={handleAdd}>Agregar</Button>
    </div>

    {#if loading}
        <p>Cargando base de datos...</p>
    {:else}
        <div class="border rounded-md p-4">
            {#each items as item (item.id)}
                <div class="flex justify-between items-center py-2 border-b last:border-0">
                    <span class={item.status === 'completed' ? 'line-through text-gray-400' : ''}>
                        {item.title}
                    </span>
                    {#if item.status === 'pending'}
                        <Button variant="outline" size="sm" onclick={() => handleComplete(item.id)}>
                            Completar
                        </Button>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>
