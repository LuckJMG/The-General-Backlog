<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import Settings from "@lucide/svelte/icons/settings";
    import { updateBacklog, deleteBacklog } from "$lib/backlog";
    import { goto, invalidateAll } from "$app/navigation";
    import type { Backlog } from "$lib/types/db";

    let { backlog } = $props<{ backlog: Backlog }>();

    let open = $state(false);
    let alertOpen = $state(false);
    let name = $derived(backlog.name);
    let loading = $state(false);

    $effect(() => {
        name = backlog.name;
    });

    async function handleUpdate() {
        if (!name.trim()) return;
        loading = true;
        try {
            await updateBacklog(backlog.id, name);
            await invalidateAll();
            open = false;
        } finally {
            loading = false;
        }
    }

    async function handleDelete() {
        loading = true;
        try {
            await deleteBacklog(backlog.id);
            await invalidateAll();
            open = false;
            alertOpen = false;
            goto('?'); 
        } finally {
            loading = false;
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger>
        {#snippet child({ props })}
            <Button {...props} size="icon" variant="outline">
                <Settings class="h-4 w-4" />
            </Button>
        {/snippet}
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Edit Backlog</Dialog.Title>
            <Dialog.Description>
				Modify the name or delete this collection.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="edit-name" class="text-right">Name</Label>
                <Input id="edit-name" bind:value={name} class="col-span-3" />
            </div>
        </div>

        <Dialog.Footer class="flex justify-between sm:justify-between">
             <AlertDialog.Root bind:open={alertOpen}>
                <AlertDialog.Trigger>
                    {#snippet child({ props })}
                        <Button variant="destructive" {...props}>Delete</Button>
                    {/snippet}
                </AlertDialog.Trigger>
                <AlertDialog.Content>
                    <AlertDialog.Header>
                        <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                        <AlertDialog.Description>
							This action can't be undone. The backlog
                            <span class="font-bold">"{backlog.name}"</span> and
                            <span class="font-bold text-red-500">ALL of its associated entries</span>
							will be deleted permanently.
                        </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action class="bg-red-600 hover:bg-red-700" onclick={handleDelete}>
							Yes, delete everything
                        </AlertDialog.Action>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog.Root>

            <Button type="submit" onclick={handleUpdate} disabled={loading}>Save Changes</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
