<script lang="ts" generics="TData extends DbEntry, TValue">
import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import PencilIcon from "@lucide/svelte/icons/pencil";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import {
	type ColumnDef,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
} from "@tanstack/table-core";
import DeleteEntryDialog from "$lib/components/delete-entry-dialog.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { ButtonGroup } from "$lib/components/ui/button-group/index.js";
import {
	createSvelteTable,
	FlexRender,
} from "$lib/components/ui/data-table/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import { type DbEntry } from "$lib/db";
import { cn } from "$lib/utils.js";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onDelete: (id: number) => void;
	onEditRequest: (entry: DbEntry) => void;
};

let { data, columns, onDelete, onEditRequest }: DataTableProps<TData, TValue> =
	$props();

let pendingDelete = $state<DbEntry | null>(null);
let deleteOpen = $state(false);

let sorting = $state<SortingState>([{ id: "priority", desc: true }]);

const table = createSvelteTable({
	get data() {
		return data;
	},
	get columns() {
		return columns;
	},
	getCoreRowModel: getCoreRowModel(),
	getSortedRowModel: getSortedRowModel(),
	state: {
		get sorting() {
			return sorting;
		},
	},
	onSortingChange: (updater) => {
		sorting =
			typeof updater === "function"
				? (updater as (old: SortingState) => SortingState)(sorting)
				: updater;
	},
});
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						{@const sorted = header.column.getIsSorted()}
						<Table.Head
							colspan={header.colSpan}
							aria-sort={sorted === "asc"
								? "ascending"
								: sorted === "desc"
									? "descending"
									: "none"}
							class={cn(
								header.column.columnDef.meta?.headAlign === "center" && "text-center",
							)}
						>
							{#if !header.isPlaceholder}
								<button
									type="button"
									onclick={header.column.getToggleSortingHandler()!}
									class="inline-flex items-center gap-1 font-bold cursor-pointer select-none hover:text-foreground/80 transition-colors"
								>
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
									{#if sorted === "asc"}
										<ArrowUpIcon class="size-3.5" />
									{:else if sorted === "desc"}
										<ArrowDownIcon class="size-3.5" />
									{:else}
										<ChevronsUpDownIcon class="size-3.5 opacity-50" />
									{/if}
								</button>
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
							class={cell.column.columnDef.meta?.align === "right"
								? "text-right"
								: undefined}
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
								onclick={() => onEditRequest(row.original)}
								class="bg-background border"
							>
								<PencilIcon />
							</Button>
							<Button
								variant="outline"
								size="icon-xs"
								type="button"
								aria-label="Delete entry"
								onclick={() => {
									pendingDelete = row.original;
									deleteOpen = true;
								}}
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

<DeleteEntryDialog
	entry={pendingDelete}
	bind:open={deleteOpen}
	onConfirm={onDelete}
	onOpenChange={(next) => {
		if (!next) pendingDelete = null;
	}}
/>
