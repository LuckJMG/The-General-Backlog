<script lang="ts">
import BadgeSelect from "$lib/components/badge-select.svelte";
import InterestBadge from "$lib/components/interest-badge.svelte";
import RatingBadge from "$lib/components/rating-badge.svelte";
import StatusBadge from "$lib/components/status-badge.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import {
	type DbEntry,
	ENTRY_INTERESTS,
	ENTRY_STATUSES,
	type EntryInput,
	type EntryInterest,
	type EntryRating,
	type EntryStatus,
	RATING_VALUES,
} from "$lib/db";

type Props = {
	entry: DbEntry | null;
	onSubmit: (input: EntryInput) => Promise<DbEntry>;
	submitLabel: string;
	submittingLabel: string;
	dialogTitle: string;
	open?: boolean;
	showRating?: boolean;
	showComments?: boolean;
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
	showRating = false,
	showComments = false,
	onSubmitted,
	onClose,
}: Props = $props();

type Form = {
	title: string;
	rating: string;
	status: EntryStatus;
	interest: EntryInterest;
	score: string;
	duration: string;
	comments: string;
};

const DEFAULT_FORM: Form = {
	title: "",
	rating: "",
	status: "pending",
	interest: "neutral",
	score: "",
	duration: "",
	comments: "",
};

let form = $state<Form>({ ...DEFAULT_FORM });
let submitting = $state(false);

$effect(() => {
	if (entry) {
		form.title = entry.title;
		form.rating = entry.rating == null ? "" : String(entry.rating);
		form.status = entry.status;
		form.interest = entry.interest;
		form.score = String(entry.score);
		form.duration = String(entry.duration);
		form.comments = entry.comments ?? "";
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
		const rating: EntryRating | null =
			form.rating === "" ? null : (Number(form.rating) as EntryRating);
		const comments = form.comments.trim() === "" ? null : form.comments.trim();
		const result = await onSubmit({
			title: form.title.trim(),
			rating,
			status: form.status,
			score: Number(form.score),
			duration: Number(form.duration),
			interest: form.interest,
			comments,
		});
		onSubmitted?.(result);
		form = { ...DEFAULT_FORM };
		open = false;
	} finally {
		submitting = false;
	}
}

function handleOpenChange(next: boolean) {
	open = next;
	if (!next) onClose?.();
}

const RATING_OPTIONS: readonly string[] = ["", ...RATING_VALUES.map(String)];
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
			{#if showRating}
				<BadgeSelect
					id="entry-rating"
					label="Rating"
					bind:value={form.rating}
					options={RATING_OPTIONS}
				>
					{#snippet render(rating: string)}
						{#if rating === ""}
							<span class="text-muted-foreground">-</span>
						{:else}
							<RatingBadge rating={Number(rating) as EntryRating} />
						{/if}
					{/snippet}
				</BadgeSelect>
			{/if}
			{#if showComments}
				<div class="flex flex-col gap-2">
					<Label for="entry-comments">Comments</Label>
					<Textarea
						id="entry-comments"
						bind:value={form.comments}
						rows={4}
						class="min-h-24"
					/>
				</div>
			{/if}
			<Dialog.Footer>
				<Button type="submit" disabled={!canSubmit || submitting}>
					{submitting ? submittingLabel : submitLabel}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
