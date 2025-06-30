<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
    import { Entry } from "$lib/entry";
    import { dashboardStore } from "$lib/dashboard.svelte";
	import Trash2 from "@lucide/svelte/icons/trash-2";

	let { id, isOpen: isDialogOpen = $bindable() } = $props();

	let existingEntry = $derived(dashboardStore.entries[id]);
	let title = $state("");
	let score: number | null = $state(null);
	let duration: number | null = $state(null);

	$effect(() => {
		if (isDialogOpen && existingEntry) {
			title = existingEntry.title;
			score = existingEntry.score;
			duration = existingEntry.duration;
		}
	});

    let entryExists = $derived(
        title !== "" &&
        title !== existingEntry?.title &&
		Entry.getID(title) in dashboardStore.entries
    );

	let disabled = $derived(
		title.trim() === "" ||
		score === null ||
		duration === null ||
		entryExists ||
		!existingEntry
	);

	$effect(() => {
		if (isDialogOpen && existingEntry) {
			title = existingEntry.title;
			score = existingEntry.score;
			duration = existingEntry.duration;
		} else if (isDialogOpen && !existingEntry) {
			isDialogOpen = false;
		}
	});

	function onSave() {
		if (!existingEntry || !title || score === null || duration === null)
			return;
		if (entryExists) return;

		let updatedEntry = new Entry(title, score, duration);
		dashboardStore.editEntry(Entry.getID(existingEntry.title), updatedEntry);

		isDialogOpen = false;
	}

	function onDelete() {
		if (!existingEntry) return;
		isDialogOpen = false;
		dashboardStore.deleteEntry(Entry.getID(existingEntry.title));
	}
</script>

<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{existingEntry?.title || ""}</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="space-y-2">
				<Label for="title">Title</Label>
				<Input id="title" bind:value={title} class="col-span-3" required/>
				{#if entryExists}
				<p class="text-sm text-red-500 col-span-4">An entry with this title already exists</p>
				{/if}
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="score">Score</Label>
					<Input id="score" type="number" bind:value={score} class="col-span-1" required/>
				</div>
				<div class="space-y-2">
					<Label for="duration">Duration</Label>
					<Input id="duration" type="number" bind:value={duration} class="col-span-1" required/>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<div class="flex items-center justify-between w-full">
				<Button variant="destructive" onclick={onDelete}>
					<Trash2 class="size-4" />
				</Button>
				<Button onclick={onSave} {disabled}>Save Changes</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
