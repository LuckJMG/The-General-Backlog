<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Dialog from "$lib/components/ui/dialog";
    import Plus from "@lucide/svelte/icons/plus";
    import { createBacklog } from "$lib/backlog";
    import { goto, invalidateAll } from "$app/navigation";

    let open = $state(false);
    let name = $state("");
    let loading = $state(false);

    async function handleSubmit() {
        if (!name.trim()) return;
        loading = true;
        try {
            const newId = await createBacklog(name);
            await invalidateAll();
            open = false;
            name = "";
            goto(`?backlog=${newId}`);
        } finally {
            loading = false;
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger>
        {#snippet child({ props })}
            <Button {...props} size="icon" variant="outline">
                <Plus class="h-4 w-4" />
            </Button>
        {/snippet}
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create Backlog</Dialog.Title>
            <Dialog.Description>
				Adds a new collection to your library.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" bind:value={name} class="col-span-3" placeholder="Ej: Anime 2025" />
            </div>
        </div>
        <Dialog.Footer>
            <Button type="submit" onclick={handleSubmit} disabled={loading}>Save</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
