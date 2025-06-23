<script>
    import { Button } from "../ui/button";

	let { table } = $props();
</script>
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
