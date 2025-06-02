<script lang="ts">
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
    import { entries, updateCookies } from "$lib/dashboard.svelte";
	import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import { Entry } from "$lib/entry";

	let title = $state("");
	let score: number | null = $state(null);
	let duration: number | null = $state(null);
	let isDialogOpen = $state(false);

	function onclick() {
		if (!title || score === null || duration === null) return;
		if (entries.some(entry => entry.id === Entry.getId(title))) return;

		entries.push(new Entry(title, score, duration))
		updateCookies();

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
			<Button {onclick}>Add Entry</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
