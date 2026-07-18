<script lang="ts" generics="TData extends DbEntry, TValue">
import PencilIcon from "@lucide/svelte/icons/pencil";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
import EntryDialog from "$lib/components/entry-dialog.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { ButtonGroup } from "$lib/components/ui/button-group/index.js";
import {
	createSvelteTable,
	FlexRender,
} from "$lib/components/ui/data-table/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import { type DbEntry, updateEntry } from "$lib/db";
import { cn } from "$lib/utils.js";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onDelete: (id: number) => void;
	onEdit: (entry: DbEntry) => void;
};

let { data, columns, onDelete, onEdit }: DataTableProps<TData, TValue> =
	$props();

let editing = $state<DbEntry | null>(null);

const table = createSvelteTable({
	get data() {
		return data;
	},
	get columns() {
		return columns;
	},
	getCoreRowModel: getCoreRowModel(),
});
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
				{#each headerGroup.headers as header (header.id)}
					<Table.Head
						colspan={header.colSpan}
						class={cn(
							"font-bold",
							header.column.columnDef.meta?.headAlign === "center" && "text-center",
						)}
					>
						{#if !header.isPlaceholder}
							<FlexRender
								content={header.column.columnDef.header}
								context={header.getContext()}
							/>
						{/if}
					</Table.Head>
				{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row class="group relative">
				{#each row.getVisibleCells() as cell (cell.id)}
					<Table.Cell
						class={cell.column.columnDef.meta?.align === "right" ? "text-right" : undefined}
					>
						<FlexRender
							content={cell.column.columnDef.cell}
							context={cell.getContext()}
						/>
					</Table.Cell>
				{/each}
					<Table.Cell class="relative w-0 p-0">
						<ButtonGroup
							class="absolute top-0 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Button
								variant="outline"
								size="icon-xs"
								type="button"
								aria-label="Edit entry"
								onclick={() => (editing = { ...row.original })}
								class="bg-background border"
							>
								<PencilIcon />
							</Button>
							<Button
								variant="outline"
								size="icon-xs"
								type="button"
								aria-label="Delete entry"
								onclick={() => onDelete(row.original.id)}
								class="bg-background text-destructive hover:bg-red-100 hover:text-destructive border"
							>
								<Trash2Icon />
							</Button>
						</ButtonGroup>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length + 1} class="h-24 text-center">
						No results.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<EntryDialog
	entry={editing}
	submitLabel="Save"
	submittingLabel="Saving..."
	dialogTitle="Edit Entry"
	onSubmit={(t, s, d) => updateEntry(editing!.id, t, s, d)}
	onSubmitted={(u) => {
		onEdit(u);
		editing = null;
	}}
	onClose={() => (editing = null)}
/>
