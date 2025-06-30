<script lang="ts">
	import Pencil from "@lucide/svelte/icons/pencil";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import { Button } from "$lib/components/ui/button/index.js";
	import { dashboardStore } from "$lib/dashboard.svelte";
    import EditEntry from "../EditEntry.svelte";

	let { id } = $props();

	let isEditDialogOpen = $state(false);
</script>

<div class="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
	<Button
		variant="ghost"
		size="icon"
		class="relative size-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
		onclick={() => isEditDialogOpen = true}
	>
		<span class="sr-only">Edit</span>
		<Pencil class="size-4" />
	</Button>

	<Button
		variant="ghost"
		size="icon"
		class="relative size-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
		onclick={() => dashboardStore.deleteEntry(id)}
	>
		<span class="sr-only">Delete</span>
		<Trash2 class="size-4" />
	</Button>
</div>

<EditEntry {id} bind:isOpen={isEditDialogOpen} />
