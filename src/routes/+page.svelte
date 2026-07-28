<script lang="ts">
import PlusIcon from "@lucide/svelte/icons/plus";
import SearchIcon from "@lucide/svelte/icons/search";
import SettingsIcon from "@lucide/svelte/icons/settings";
import { onMount } from "svelte";
import { columns } from "$lib/columns.js";
import AddEntryDialog from "$lib/components/add-entry-dialog.svelte";
import DataTable from "$lib/components/data-table.svelte";
import EditEntryDialog from "$lib/components/edit-entry-dialog.svelte";
import SettingsDialog from "$lib/components/settings-dialog.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { type DbEntry, deleteEntry, initDb, listEntries } from "$lib/db";
import { prioritize } from "$lib/priority";

let entries = $state.raw<DbEntry[]>([]);
let query = $state("");
let rows = $derived(
	prioritize(entries).filter((entry) =>
		entry.title.toLowerCase().includes(query.trim().toLowerCase()),
	),
);

onMount(async () => {
	await initDb();
	entries = await listEntries();
});

let addOpen = $state(false);
let editOpen = $state(false);
let settingsOpen = $state(false);
let editing = $state<DbEntry | null>(null);

async function handleDelete(id: number) {
	await deleteEntry(id);
	entries = entries.filter((e) => e.id !== id);
}
</script>

<div class="m-16">
	<div class="mb-4 flex items-center gap-2">
		<div class="relative max-w-sm flex-1">
			<SearchIcon
				class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:value={query}
				placeholder="Filter by title…"
				class="pl-8"
				aria-label="Filter by title"
			/>
		</div>
		<div class="ml-auto flex gap-2">
			<Button variant="outline" onclick={() => (addOpen = true)}>
				<PlusIcon />
				Add entry
			</Button>
			<Button
				variant="ghost"
				size="icon"
				aria-label="Settings"
				onclick={() => (settingsOpen = true)}
			>
				<SettingsIcon />
			</Button>
		</div>
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
		<SettingsDialog
			bind:open={settingsOpen}
			onReplaced={(r) => (entries = r)}
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
