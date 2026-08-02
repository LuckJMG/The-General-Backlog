<script lang="ts">
import PlusIcon from "@lucide/svelte/icons/plus";
import SearchIcon from "@lucide/svelte/icons/search";
import SettingsIcon from "@lucide/svelte/icons/settings";
import XIcon from "@lucide/svelte/icons/x";
import { onMount } from "svelte";
import { columns } from "$lib/columns.js";
import DataTable from "$lib/components/data-table.svelte";
import EntryDialog from "$lib/components/entry-dialog.svelte";
import SettingsDialog from "$lib/components/settings-dialog.svelte";
import StatusBadge from "$lib/components/status-badge.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import * as Pagination from "$lib/components/ui/pagination/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import {
	type DbEntry,
	deleteEntry,
	ENTRY_STATUSES,
	type EntryStatus,
	initDb,
	listEntries,
} from "$lib/db";
import { prioritize } from "$lib/priority";

const PER_PAGE = 20;

let entries = $state.raw<DbEntry[]>([]);
let query = $state("");
let statusFilter = $state<EntryStatus | "all">("all");
let page = $state(1);
let rows = $derived(
	prioritize(entries)
		.filter((entry) =>
			entry.title.toLowerCase().includes(query.trim().toLowerCase()),
		)
		.filter((entry) => statusFilter === "all" || entry.status === statusFilter),
);
let pagedRows = $derived(rows.slice((page - 1) * PER_PAGE, page * PER_PAGE));

$effect(() => {
	rows.length;
	page = 1;
});

onMount(async () => {
	await initDb();
	entries = await listEntries();
});

let dialogOpen = $state(false);
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
		<Select.Root type="single" bind:value={statusFilter}>
			<Select.Trigger class="w-30" aria-label="Filter by status">
				{#if statusFilter === "all"}
					<span>All statuses</span>
				{:else}
					<StatusBadge status={statusFilter} />
				{/if}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all" label="All statuses">All statuses</Select.Item>
				{#each ENTRY_STATUSES as s (s)}
					<Select.Item value={s} label={s}>
						<StatusBadge status={s} />
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		{#if statusFilter !== "all" || query !== ""}
			<Button
				variant="ghost"
				size="icon"
				aria-label="Clear filters"
				onclick={() => {
					statusFilter = "all";
					query = "";
				}}
			>
				<XIcon />
			</Button>
		{/if}
		<div class="ml-auto flex gap-2">
			<Button variant="outline" onclick={() => (dialogOpen = true)}>
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
		<EntryDialog
			bind:open={dialogOpen}
			mode={editing ? "edit" : "add"}
			entry={editing}
			onSubmitted={(e) => {
				entries = editing
					? entries.map((x) => (x.id === e.id ? e : x))
					: [...entries, e];
			}}
			onClose={() => (editing = null)}
		/>
		<SettingsDialog
			bind:open={settingsOpen}
			onReplaced={(r) => (entries = r)}
		/>
	</div>
	<DataTable
		data={pagedRows}
		{columns}
		onDelete={handleDelete}
		onEditRequest={(e) => {
			editing = { ...e };
			dialogOpen = true;
		}}
	/>
	<Pagination.Root count={rows.length} perPage={PER_PAGE} bind:page class="mt-4">
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as p (p.key)}
					{#if p.type === "ellipsis"}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link page={p} isActive={p.value === currentPage}>
								{p.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</div>
