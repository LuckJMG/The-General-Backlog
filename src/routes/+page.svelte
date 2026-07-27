<script lang="ts">
import PlusIcon from "@lucide/svelte/icons/plus";
import { onMount } from "svelte";
import { columns } from "$lib/columns.js";
import AddEntryDialog from "$lib/components/add-entry-dialog.svelte";
import DataTable from "$lib/components/data-table.svelte";
import EditEntryDialog from "$lib/components/edit-entry-dialog.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { type DbEntry, deleteEntry, initDb, listEntries } from "$lib/db";
import { prioritize } from "$lib/priority";

let entries = $state.raw<DbEntry[]>([]);
let rows = $derived(prioritize(entries));

onMount(async () => {
	await initDb();
	entries = await listEntries();
});

let addOpen = $state(false);
let editOpen = $state(false);
let editing = $state<DbEntry | null>(null);

async function handleDelete(id: number) {
	await deleteEntry(id);
	entries = entries.filter((e) => e.id !== id);
}
</script>

<div class="m-16">
	<div class="mb-4 flex justify-start">
		<Button variant="outline" onclick={() => (addOpen = true)}>
			<PlusIcon />
			Add entry
		</Button>
		<AddEntryDialog
			bind:open={addOpen}
			onSubmitted={(e) => (entries = [...entries, e])}
		/>
		<EditEntryDialog
			bind:open={editOpen}
			entry={editing}
			onSubmitted={(u) => (entries = entries.map((e) => (e.id === u.id ? u : e)))}
			onClose={() => (editing = null)}
		/>
	</div>
	<DataTable
		data={rows}
		{columns}
		onDelete={handleDelete}
		onEditRequest={(e) => {
			editing = { ...e };
			editOpen = true;
		}}
	/>
</div>
