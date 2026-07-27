<script lang="ts">
import BadgeSelect from "$lib/components/badge-select.svelte";
import InterestBadge from "$lib/components/interest-badge.svelte";
import StatusBadge from "$lib/components/status-badge.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import {
	addEntry,
	type DbEntry,
	ENTRY_INTERESTS,
	ENTRY_STATUSES,
	type EntryInterest,
	type EntryStatus,
} from "$lib/db";

type Props = {
	open?: boolean;
	onSubmitted?: (entry: DbEntry) => void;
};

let { open = $bindable(false), onSubmitted }: Props = $props();

type Form = {
	title: string;
	status: EntryStatus;
	interest: EntryInterest;
	score: string;
	duration: string;
};

const DEFAULT_FORM: Form = {
	title: "",
	status: "pending",
	interest: "neutral",
	score: "",
	duration: "",
};

let form = $state<Form>({ ...DEFAULT_FORM });
let submitting = $state(false);

const canSubmit = $derived.by(() => {
	const score = Number(form.score);
	const duration = Number(form.duration);
	return (
		form.title.trim() !== "" &&
		Number.isFinite(score) &&
		score > 0 &&
		Number.isFinite(duration) &&
		duration > 0
	);
});

async function submit() {
	if (!canSubmit) return;
	submitting = true;
	try {
		const result = await addEntry({
			title: form.title.trim(),
			rating: null,
			status: form.status,
			score: Number(form.score),
			duration: Number(form.duration),
			interest: form.interest,
			comments: null,
		});
		onSubmitted?.(result);
		form = { ...DEFAULT_FORM };
		open = false;
	} finally {
		submitting = false;
	}
}
</script>

<Dialog.Root bind:open>
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
				<Label for="entry-title">Title</Label>
				<Input id="entry-title" bind:value={form.title} autocomplete="off" />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<BadgeSelect
					id="entry-status"
					label="Status"
					bind:value={form.status}
					options={ENTRY_STATUSES}
				>
					{#snippet render(status: EntryStatus)}
						<StatusBadge {status} />
					{/snippet}
				</BadgeSelect>
				<BadgeSelect
					id="entry-interest"
					label="Interest"
					bind:value={form.interest}
					options={ENTRY_INTERESTS}
				>
					{#snippet render(interest: EntryInterest)}
						<InterestBadge {interest} />
					{/snippet}
				</BadgeSelect>
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
					{submitting ? "Adding..." : "Add"}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
