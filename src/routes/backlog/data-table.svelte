<script lang="ts" generics="TData, TValue">
import { goto } from '$app/navigation';
import { page } from '$app/state';
import {
	type ColumnDef,
	getCoreRowModel,
} from "@tanstack/table-core";
import {
	createSvelteTable,
	FlexRender
} from "$lib/components/ui/data-table/index";
import * as Table from "$lib/components/ui/table/index";
import * as Pagination from "$lib/components/ui/pagination";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	totalCount: number;
	pageIndex: number;  // 0-based
	pageSize: number;
};

let { data, columns, totalCount, pageIndex, pageSize }: DataTableProps<TData, TValue> = $props();

const table = createSvelteTable({
	get data() { return data; },
	get columns() { return columns; },
	getCoreRowModel: getCoreRowModel(),

	manualPagination: true,
	get rowCount() { return totalCount; }, 

	state: {
		get pagination() { 
			return { 
				pageIndex: pageIndex, 
				pageSize: pageSize 
			}; 
		},
	},
});

const handlePageChange = (newPage: number) => {
	const params = new URLSearchParams(page.url.searchParams);

	params.set('page', String(newPage));
	params.set('limit', String(pageSize)); 

	goto(`?${params.toString()}`, { keepFocus: true });
};
</script>

<div class="space-y-4">
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head colspan={header.colSpan}>
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

	<Pagination.Root 
		count={totalCount} 
		perPage={pageSize} 
		page={pageIndex + 1} 
		onPageChange={handlePageChange}
	>
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>

				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link 
								{page} 
								isActive={currentPage === page.value}
							>
								{page.value}
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
