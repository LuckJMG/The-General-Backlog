<script lang="ts">
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { dashboardStore } from "$lib/dashboard.svelte";
    import EditEntry from "../EditEntry.svelte";

	let { id } = $props();

	let isEditDialogOpen = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
	{#snippet child({ props })}
		<Button
			{...props}
			variant="ghost"
			size="icon"
			class="relative size-8 p-0"
		>
			<span class="sr-only">Open menu</span>
			<Ellipsis />
		</Button>
	{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={() => isEditDialogOpen = true}>Edit</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => dashboardStore.deleteEntry(id)}>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<EditEntry {id} bind:isOpen={isEditDialogOpen} />
