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

let form = $state({ title: "", score: "", duration: "" });
let submitting = $state(false);

$effect(() => {
	if (entry) {
		form.title = entry.title;
		form.score = String(entry.score);
		form.duration = String(entry.duration);
	}
});

const canSubmit = $derived.by(() => {
	const s = Number(form.score);
	const d = Number(form.duration);
	return (
		form.title.trim() !== "" &&
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
			form.title.trim(),
			Number(form.score),
			Number(form.duration),
		);
		onSubmitted?.(result);
		form = { title: "", score: "", duration: "" };
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
					bind:value={form.title}
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
						bind:value={form.score}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="entry-duration">Duration</Label>
					<Input
						id="entry-duration"
						type="number"
						min="0"
						bind:value={form.duration}
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
