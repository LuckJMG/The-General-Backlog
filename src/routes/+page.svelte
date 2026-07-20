<script lang="ts">
import PlusIcon from "@lucide/svelte/icons/plus";
import { onMount } from "svelte";
import EntryDialog from "$lib/components/entry-dialog.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import {
	addEntry,
	type DbEntry,
	deleteEntry,
	initDb,
	listEntries,
	updateEntry,
} from "$lib/db";
import { prioritize } from "$lib/priority";
import { columns } from "./columns.js";
import DataTable from "./data-table.svelte";

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
		<EntryDialog
			bind:open={addOpen}
			entry={null}
			submitLabel="Add"
			submittingLabel="Adding..."
			dialogTitle="New Entry"
			onSubmit={addEntry}
			onSubmitted={(e) => (entries = [...entries, e])}
		/>
		<EntryDialog
			bind:open={editOpen}
			entry={editing}
			submitLabel="Save"
			submittingLabel="Saving..."
			dialogTitle="Edit Entry"
			onSubmit={(t, s, d) => updateEntry(editing!.id, t, s, d)}
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
