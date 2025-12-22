<script lang="ts">
    import DataTable from "./data-table.svelte";
    import { columns } from "./columns";
	import seedDB from '$lib/tests/seed';
    import { Button } from "$lib/components/ui/button";
    import { invalidateAll } from "$app/navigation";
    import BacklogSwitcher from "./components/backlog-switcher.svelte";
    import CreateBacklogDialog from "./components/create-backlog-dialog.svelte";
    import EditBacklogDialog from "./components/edit-backlog-dialog.svelte";
    import CreateEntryDialog from "./components/create-entry-dialog.svelte";
    import EditEntryDialog from "./components/edit-entry-dialog.svelte";
    import * as ButtonGroup from "$lib/components/ui/button-group";
    import type { Entry } from "$lib/types/domain";

    let { data } = $props();

    let editingEntry = $state<Entry | null>(null);
    let editOpen = $state(false);

    function handleRowClick(entry: Entry) {
        editingEntry = entry;
        editOpen = true;
    }
</script>

<div class="container mx-auto py-10 space-y-6">
    <div class="flex justify-between items-start">
        <div class="flex items-center gap-2">
			<ButtonGroup.Root>
				<BacklogSwitcher
					backlogs={data.backlogs}
					activeBacklogId={data.activeBacklog?.id}
				/>

				{#if data.activeBacklog}
					<EditBacklogDialog backlog={data.activeBacklog} />
				{/if}

				<CreateBacklogDialog />
			</ButtonGroup.Root>
        </div>

        <div class="flex gap-2">
            {#if data.activeBacklog}
                <CreateEntryDialog />
            {/if}

            <Button 
                variant="destructive" 
                onclick={async () => {
                    if(confirm('Delete DB and generate test data?')) {
                        await seedDB();
                        await invalidateAll();
                    }
                }}
            >
                ?? Reset & Seed
            </Button>
        </div>
    </div>

    {#if data.activeBacklog}
        <DataTable
            data={data.entries.data}
            columns={columns}
            totalCount={data.entries.total}
            pageIndex={data.entries.page - 1}
            pageSize={data.entries.pageSize}
            onRowClick={handleRowClick}
        />
    {:else}
        <div class="flex flex-col items-center justify-center h-64 border rounded-md bg-muted/10">
            <p class="text-lg font-medium text-muted-foreground mb-4">There are no backlogs.</p>
            <CreateBacklogDialog />
        </div>
    {/if}

    {#if editingEntry}
        <EditEntryDialog 
            bind:open={editOpen} 
            entry={editingEntry} 
        />
    {/if}
</div>
