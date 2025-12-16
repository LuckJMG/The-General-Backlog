<script lang="ts" generics="TData, TValue">
import { goto } from '$app/navigation';
import { page } from '$app/state';
import {
	type ColumnDef,
	getCoreRowModel,
	type SortingState,
	type OnChangeFn

} from "@tanstack/table-core";
import {
	createSvelteTable,
	FlexRender
} from "$lib/components/ui/data-table/index";
import * as Table from "$lib/components/ui/table/index";
import * as Pagination from "$lib/components/ui/pagination";
import * as InputGroup from "$lib/components/ui/input-group";
import * as Select from '$lib/components/ui/select';
import SearchIcon from "@lucide/svelte/icons/search";
import X from '@lucide/svelte/icons/x';
import { EntryStatus, EntryInterest } from '$lib/types/db';
import StatusCell from './status-cell.svelte';
import InterestCell from './interest-cell.svelte';

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	totalCount: number;
	pageIndex: number;  // 0-based
	pageSize: number;
	onRowClick?: (row: TData) => void;
};

let { data, columns, totalCount, pageIndex, pageSize, onRowClick }: DataTableProps<TData, TValue> = $props();

let sortBy = $derived(page.url.searchParams.get('sortBy') || 'priority');
let sortDir = $derived(page.url.searchParams.get('sortOrder') || 'desc');
let sorting = $derived<SortingState>([
	{
		id: sortBy,
		desc: sortDir === 'desc'
	}
]);

const setSorting: OnChangeFn<SortingState> = (updater) => {
	let newSortingState = typeof updater === "function" ? updater(sorting) : updater;
	let params = new URLSearchParams(page.url.searchParams);

	if (newSortingState.length > 0) {
		let rule = newSortingState[0];
		params.set('sortBy', rule.id);
		params.set('sortOrder', rule.desc ? 'desc' : 'asc');
	} else {
		params.delete('sortBy');
		params.delete('sortOrder');
	}

	goto(`?${params.toString()}`, { keepFocus: true });
};


let searchInput = $state<HTMLInputElement | null>(null);
let search = $state<string>(page.url.searchParams.get('search') || '');
let timer: ReturnType<typeof setTimeout>;

const onSearch = () => {
	let params = new URLSearchParams(page.url.searchParams);

	search === '' ? params.delete('search') : params.set('search', search);
	params.set('page', '1');

	goto(`?${params.toString()}`, { keepFocus: true, replaceState: true });
}

let statusFilter = $state<string>(page.url.searchParams.get('status') || '');
let interestFilter = $state<string>(page.url.searchParams.get('interest') || '');

const onFilterChange = (key: 'status' | 'interest', value: string) => {
	let params = new URLSearchParams(page.url.searchParams);

	if (value) {
		params.set(key, value);
	} else {
		params.delete(key);
	}

	params.set('page', '1');

	goto(`?${params.toString()}`, { keepFocus: true, replaceState: true });
}

const clearAll = () => {
	search = '';
	statusFilter = '';
	interestFilter = '';
	
	// Reset params
	let params = new URLSearchParams(page.url.searchParams);
	params.delete('search');
	params.delete('status');
	params.delete('interest');
	params.set('page', '1');

	goto(`?${params.toString()}`, { keepFocus: true });
	searchInput?.focus();
}

const table = createSvelteTable({
	get data() { return data; },
	get columns() { return columns; },
	getCoreRowModel: getCoreRowModel(),

	manualPagination: true,
	manualSorting: true,
	get rowCount() { return totalCount; }, 

	state: {
		get pagination() {
			return {
				pageIndex: pageIndex,
				pageSize: pageSize
			};
		},
		get sorting() {
			return sorting;
		},
	},
	onSortingChange: setSorting,
});

const handlePageChange = (newPage: number) => {
	const params = new URLSearchParams(page.url.searchParams);

	params.set('page', String(newPage));
	params.set('limit', String(pageSize)); 

	goto(`?${params.toString()}`, { keepFocus: true });
};
</script>

<div class="space-y-4">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
		<div class="flex flex-1 flex-wrap items-center gap-2 w-full">
			<InputGroup.Root class='max-w-[250px] w-full'>
				<InputGroup.Input
					bind:ref={searchInput}
					placeholder="Search..."
					bind:value={search}
					oninput={() => {
						clearTimeout(timer);
						timer = setTimeout(onSearch, 300);
					}}
					class="h-8"
				/>
				<InputGroup.Addon>
					<SearchIcon class='size-4 text-muted-foreground'/>
				</InputGroup.Addon>
				{#if search !== ''}
					<InputGroup.Addon align='inline-end'>
						<button
							onclick={() => {
								search = '';
								onSearch();
								searchInput?.focus();
							}}
							class="text-muted-foreground hover:text-foreground transition-colors p-1"
							aria-label="Clear search"
						>
							<X class="hover:cursor-pointer size-4" />
						</button>
					</InputGroup.Addon>
				{/if}
			</InputGroup.Root>

			<Select.Root
				type="single"
				bind:value={statusFilter}
				onValueChange={(v) => onFilterChange('status', v)}
			>
				<Select.Trigger class="h-8 w-[140px] relative">
					{#if statusFilter && Object.values(EntryStatus).includes(statusFilter as EntryStatus)}
						<StatusCell value={statusFilter as EntryStatus} />
					{:else}
						<span class="text-muted-foreground text-xs font-medium border-dashed">Status</span>
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Label>Status</Select.Label>
						{#each Object.values(EntryStatus) as status}
							<Select.Item value={status} label={status} class="text-xs">
								<StatusCell value={status} />
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={interestFilter} onValueChange={(v) => onFilterChange('interest', v)}>
                <Select.Trigger class="h-8 w-[140px] relative">
                    {#if interestFilter && Object.values(EntryInterest).includes(interestFilter as EntryInterest)}
                        <InterestCell value={interestFilter as EntryInterest} />
                    {:else}
                         <span class="text-muted-foreground text-xs font-medium border-dashed">Interest</span>
                    {/if}
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Interests</Select.Label>
                        {#each Object.values(EntryInterest) as interest}
                            <Select.Item value={interest} label={interest} class="text-xs">
                                <InterestCell value={interest} />
                            </Select.Item>
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>

			{#if search !== '' || statusFilter !== '' || interestFilter !== ''}
				<button onclick={clearAll} class="h-8 px-2 lg:px-3 text-sm font-medium hover:bg-muted text-muted-foreground transition-colors rounded-md flex items-center gap-1">
					Reset
					<X class="size-3" />
				</button>
			{/if}
		</div>
	</div>

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
					<Table.Row 
						data-state={row.getIsSelected() && "selected"}
						class={onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
						onclick={() => onRowClick?.(row.original)}
					>
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
