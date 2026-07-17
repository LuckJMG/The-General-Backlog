<script lang="ts">
import { onMount } from "svelte";
import { type DbEntry, initDb, listEntries } from "$lib/db";
import { prioritize } from "$lib/priority.js";
import { makeColumns } from "./columns.js";
import DataTable from "./data-table.svelte";

let entries = $state<DbEntry[]>([]);
let result = $derived(prioritize(entries));
let cols = $derived(makeColumns(result.min, result.max));

onMount(async () => {
	await initDb();
	entries = await listEntries();
});
</script>

<div class="m-16">
	<DataTable data={result.rows} columns={cols} />
</div>
