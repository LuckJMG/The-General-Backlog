<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
import { cn } from "$lib/utils";
import { Button } from "$lib/components/ui/button";
import * as Command from "$lib/components/ui/command";
import * as Popover from "$lib/components/ui/popover";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import type { Backlog } from "$lib/types/db";

let { backlogs, activeBacklogId } = $props<{ 
	backlogs: Backlog[], 
	activeBacklogId?: number 
}>();

let open = $state(false);

let selectedLabel = $derived(
	backlogs.find((b: Backlog) => b.id === activeBacklogId)?.name || "Select backlog..."
);

function onSelect(id: number) {
	let params = new URLSearchParams(page.url.searchParams);

	params.set('backlog', String(id));
	params.set('page', '1');

	goto(`?${params.toString()}`);
	open = false;
}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-[250px] justify-between"
				{...props}
			>
				{selectedLabel}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[250px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search backlog..." />
			<Command.List>
				<Command.Empty>Didn't find backlog.</Command.Empty>
				<Command.Group>
					{#each backlogs as backlog (backlog.id)}
						<Command.Item
							value={backlog.name}
							onSelect={() => onSelect(backlog.id)}
						>
							<Check
								class={cn(
									"mr-2 h-4 w-4",
									activeBacklogId === backlog.id ? "opacity-100" : "opacity-0"
								)}
							/>
							{backlog.name}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
