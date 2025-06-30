<script lang="ts">
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { MediaQuery } from "svelte/reactivity";
	import * as Pagination from "$lib/components/ui/pagination/index.js";

	let { table } = $props();

	let isDesktop = new MediaQuery("(min-width: 768px)");

	let totalCount = $derived(table.getRowCount());
	let pageSize = $derived(table.getState().pagination.pageSize);
	let currentPageIndex = $derived(table.getState().pagination.pageIndex);
	let currentPage = $derived(currentPageIndex + 1);
	let totalPages = $derived(Math.ceil(totalCount / pageSize));

	let siblingCount = $derived(isDesktop.current ? 1 : 0);

	function handlePageChange(newPage: number) {
		table.setPageIndex(newPage - 1);
	}
</script>

<div class="flex items-center justify-end py-4">
	<Pagination.Root
		count={totalPages}
		perPage={1}
		{siblingCount}
		page={currentPage}
		onPageChange={handlePageChange}
	>
		{#snippet children({ pages, currentPage: paginationCurrentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton>
						<ChevronLeftIcon class="size-4" />
						<span class="hidden sm:block">Previous</span>
					</Pagination.PrevButton>
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === "ellipsis"}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link
								{page}
								isActive={paginationCurrentPage === page.value}
							>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton>
						<span class="hidden sm:block">Next</span>
						<ChevronRightIcon class="size-4" />
					</Pagination.NextButton>
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</div>
