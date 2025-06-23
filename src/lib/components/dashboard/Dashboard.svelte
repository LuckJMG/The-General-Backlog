<script lang="ts" generics="TData, TValue">
	import {
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
        type PaginationState,
	} from "@tanstack/table-core";
	import { columns } from "./columns";
	import { entries, sorting, updateCookies } from "$lib/dashboard.svelte";
	import {
		createSvelteTable,
		FlexRender,
	} from "$lib/components/ui/data-table/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from "../ui/button";

	let stableData = $derived([...entries]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 });

	const table = createSvelteTable({
		get data() {
			return stableData;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: (updater) => {
			let newSorting = typeof updater === "function" ?
				updater(sorting) : updater;

			if (newSorting.length !== 0) sorting[0] = newSorting[0];
			else sorting.pop();

			stableData = [...entries];
			updateCookies();
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === "function" ?
				updater(pagination) : updater;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get pagination() {
				return pagination;
			},
		}
	});
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
			<Table.Row>
				{#each headerGroup.headers as header (header.id)}
				<Table.Head>
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
			<Table.Row data-state={row.getIsSelected() && "selected"}>
			{#each row.getVisibleCells() as cell (cell.id)}
				<Table.Cell>
					<FlexRender
						content={cell.column.columnDef.cell}
						context={cell.getContext()}
					/>
				</Table.Cell>
			{/each}
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={columns.length} class="h-24 text-center">
					No results.
				</Table.Cell>
			</Table.Row>
		{/each}
		</Table.Body>
	</Table.Root>
	<div class="flex items-center justify-end space-x-2 py-4">
		<Button
		variant="outline"
		size="sm"
		onclick={() => table.previousPage()}
		disabled={!table.getCanPreviousPage()}
		>
		Previous
		</Button>
		<Button
		variant="outline"
		size="sm"
		onclick={() => table.nextPage()}
		disabled={!table.getCanNextPage()}
		>
		Next
		</Button>
	</div>
</div>
