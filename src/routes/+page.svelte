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
} from "$lib/db";
import { prioritize } from "$lib/priority";
import { makeColumns } from "./columns.js";
import DataTable from "./data-table.svelte";

let entries = $state.raw<DbEntry[]>([]);
let result = $derived(prioritize(entries));
let columns = $derived(makeColumns(result.min, result.max));

onMount(async () => {
	await initDb();
	entries = await listEntries();
});

let addOpen = $state(false);

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
	</div>
	<DataTable
		data={result.rows}
		{columns}
		onDelete={handleDelete}
		onEdit={(updated) => (entries = entries.map((e) => (e.id === updated.id ? updated : e)))}
	/>
</div>
