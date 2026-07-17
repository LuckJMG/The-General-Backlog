<script lang="ts">
import PlusIcon from "@lucide/svelte/icons/plus";
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { addEntry, type DbEntry } from "$lib/db";

type Props = {
	onAdded: (entry: DbEntry) => void;
};

let { onAdded }: Props = $props();

let open = $state(false);
let name = $state("");
let score = $state("");
let duration = $state("");
let submitting = $state(false);

const canSubmit = $derived.by(() => {
	const s = Number(score);
	const d = Number(duration);
	return (
		name.trim() !== "" &&
		Number.isFinite(s) &&
		s > 0 &&
		Number.isFinite(d) &&
		d > 0
	);
});

async function submit() {
	if (!canSubmit) return;
	submitting = true;
	try {
		const created = await addEntry(
			name.trim(),
			Number(score),
			Number(duration),
		);
		onAdded(created);

		// Reset form
		name = "";
		score = "";
		duration = "";

		open = false;
	} finally {
		submitting = false;
	}
}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>
				<PlusIcon />
				Add entry
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>New Entry</Dialog.Title>
		</Dialog.Header>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			class="flex flex-col gap-4"
		>
			<div class="flex flex-col gap-2">
				<Label for="entry-name">Name</Label>
				<Input
					id="entry-name"
					bind:value={name}
					placeholder="The Pragmatic Programmer"
					autocomplete="off"
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<Label for="entry-score">Score</Label>
					<Input
						id="entry-score"
						type="number"
						step="0.1"
						min="0"
						bind:value={score}
						placeholder="8.4"
					/>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="entry-duration">Duration</Label>
					<Input
						id="entry-duration"
						type="number"
						min="0"
						bind:value={duration}
						placeholder="12"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={!canSubmit || submitting}>
					{submitting ? "Adding..." : "Add"}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
