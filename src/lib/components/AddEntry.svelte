<script lang="ts">
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import { Entry } from "$lib/entry";
    import { dashboardStore } from "$lib/dashboard.svelte";

	let title = $state("");
	let score: number | null = $state(null);
	let duration: number | null = $state(null);
	let isDialogOpen = $state(false);
	let entryExists = $derived(
		title !== "" &&
		dashboardStore.entries.some(entry => entry.id === Entry.getId(title))
	)
	let disabled = $derived(
		title.trim() === "" ||
		score === null ||
		duration === null ||
		entryExists
	);

	function onclick() {
		if (!title || score === null || duration === null) return;
		if (dashboardStore.entries.some(entry => entry.id === Entry.getId(title))) return;

		let newEntry = new Entry(title, score, duration);
		dashboardStore.addEntry(newEntry);

		title = "";
		score = null;
		duration = null;

		isDialogOpen = false;
	}
</script>

<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
		Add Entry <CirclePlus />
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>New Entry</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="title" class="text-right">Title</Label>
				<Input id="title" bind:value={title} class="col-span-3" required/>
				{#if entryExists}
				<p class="text-sm text-red-500 col-span-4 text-center">An entry with this title already exists</p>
				{/if}
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="score" class="text-right">Score</Label>
				<Input id="score" type="number" bind:value={score} class="col-span-3" required/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="duration" class="text-right">Duration</Label>
				<Input id="duration" type="number" bind:value={duration} class="col-span-3" required/>
			</div>
		</div>
		<Dialog.Footer>
			<Button {onclick} {disabled}>Add Entry</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
