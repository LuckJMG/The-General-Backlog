<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import type { DbEntry } from "$lib/db";

type Props = {
	entry: DbEntry | null;
	onSubmit: (
		title: string,
		score: number,
		duration: number,
	) => Promise<DbEntry>;
	submitLabel: string;
	submittingLabel: string;
	dialogTitle: string;
	open?: boolean;
	onSubmitted?: (entry: DbEntry) => void;
	onClose?: () => void;
};

let {
	entry,
	onSubmit,
	submitLabel,
	submittingLabel,
	dialogTitle,
	open = $bindable(false),
	onSubmitted,
	onClose,
}: Props = $props();

let title = $state("");
let score = $state("");
let duration = $state("");
let submitting = $state(false);

$effect(() => {
	if (entry) {
		title = entry.title;
		score = String(entry.score);
		duration = String(entry.duration);
		open = true;
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
	if (!canSubmit) return;
	submitting = true;
	try {
		const result = await onSubmit(
			title.trim(),
			Number(score),
			Number(duration),
		);
		onSubmitted?.(result);
		title = "";
		score = "";
		duration = "";
		open = false;
	} finally {
		submitting = false;
	}
}

function handleOpenChange(next: boolean) {
	open = next;
	if (!next) onClose?.();
}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
		</Dialog.Header>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			class="flex flex-col gap-4"
		>
			<div class="flex flex-col gap-2">
				<Label for="entry-title">Title</Label>
				<Input
					id="entry-title"
					bind:value={title}
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
					/>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="entry-duration">Duration</Label>
					<Input
						id="entry-duration"
						type="number"
						min="0"
						bind:value={duration}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={!canSubmit || submitting}>
					{submitting ? submittingLabel : submitLabel}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
