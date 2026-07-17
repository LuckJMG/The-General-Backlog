<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { type DbEntry, updateEntry } from "$lib/db";

type Props = {
	entry: DbEntry | null;
	onUpdated: (entry: DbEntry) => void;
	onClose: () => void;
};

let { entry, onUpdated, onClose }: Props = $props();

let title = $state("");
let score = $state("");
let duration = $state("");
let submitting = $state(false);

const open = $derived(entry !== null);

$effect(() => {
	if (entry) {
		title = entry.title;
		score = String(entry.score);
		duration = String(entry.duration);
	}
});

const canSubmit = $derived.by(() => {
	const s = Number(score);
	const d = Number(duration);
	return (
		title.trim() !== "" &&
		Number.isFinite(s) &&
		s > 0 &&
		Number.isFinite(d) &&
		d > 0
	);
});

async function submit() {
	if (!entry || !canSubmit) return;
	submitting = true;
	try {
		const updated = await updateEntry(
			entry.id,
			title.trim(),
			Number(score),
			Number(duration),
		);
		onUpdated(updated);
		onClose();
	} finally {
		submitting = false;
	}
}
</script>

<Dialog.Root {open} onOpenChange={(next) => { if (!next) onClose(); }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Entry</Dialog.Title>
		</Dialog.Header>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			class="flex flex-col gap-4"
		>
			<div class="flex flex-col gap-2">
				<Label for="edit-title">Title</Label>
				<Input id="edit-title" bind:value={title} autocomplete="off" />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<Label for="edit-score">Score</Label>
					<Input
						id="edit-score"
						type="number"
						step="0.1"
						min="0"
						bind:value={score}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="edit-duration">Duration</Label>
					<Input
						id="edit-duration"
						type="number"
						min="0"
						bind:value={duration}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={!canSubmit || submitting}>
					{submitting ? "Saving..." : "Save"}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
