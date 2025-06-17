<script lang="ts" generics="TData, TValue">
	import {
		getCoreRowModel,
		getSortedRowModel,
	} from "@tanstack/table-core";
	import { columns } from "./columns";
	import { entries, sorting, updateCookies } from "$lib/dashboard.svelte";
	import {
		createSvelteTable,
		FlexRender,
	} from "$lib/components/ui/data-table/index.js";
	import * as Table from "$lib/components/ui/table/index.js";

	const table = createSvelteTable({
		get data() {
			return [...entries];
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: (updater) => {
			let newSorting = typeof updater === "function" ?
				updater(sorting) : updater;

			if (newSorting.length !== 0) sorting[0] = newSorting[0];
			else sorting.pop();

			updateCookies();
		},
		state: {
			get sorting() {
				return sorting;
			}
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
</div>
