<script lang="ts">
import { onMount } from "svelte";
import AddEntryDialog from "$lib/components/add-entry-dialog.svelte";
import { type DbEntry, deleteEntry, initDb, listEntries } from "$lib/db";
import { prioritize } from "$lib/priority";
import { columns } from "./columns.js";
import DataTable from "./data-table.svelte";

let entries = $state.raw<DbEntry[]>([]);
let result = $derived(prioritize(entries));

onMount(async () => {
	await initDb();
	entries = await listEntries();
});

async function handleDelete(id: number) {
	await deleteEntry(id);
	entries = entries.filter((e) => e.id !== id);
}
</script>

<div class="m-16">
	<div class="mb-4 flex justify-start">
		<AddEntryDialog onAdded={(e) => (entries = [...entries, e])} />
	</div>
	<DataTable
		data={result.rows}
		{columns}
		onDelete={handleDelete}
		onEdit={(updated) => (entries = entries.map((e) => (e.id === updated.id ? updated : e)))}
	/>
</div>
