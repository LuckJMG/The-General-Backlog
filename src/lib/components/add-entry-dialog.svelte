<script lang="ts">
import BadgeSelect from "$lib/components/badge-select.svelte";
import InterestBadge from "$lib/components/interest-badge.svelte";
import RatingBadge from "$lib/components/rating-badge.svelte";
import StatusBadge from "$lib/components/status-badge.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import {
	addEntry,
	type DbEntry,
	ENTRY_INTERESTS,
	ENTRY_STATUSES,
	type EntryInterest,
	type EntryRating,
	type EntryStatus,
	RATING_VALUES,
} from "$lib/db";

type Props = {
	open?: boolean;
	onSubmitted?: (entry: DbEntry) => void;
};

let { open = $bindable(false), onSubmitted }: Props = $props();

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

const RATING_OPTIONS: readonly string[] = ["", ...RATING_VALUES.map(String)];

let form = $state<Form>({ ...DEFAULT_FORM });
let submitting = $state(false);
let bulk = $state(false);

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
		const rating: EntryRating | null =
			form.rating === "" ? null : (Number(form.rating) as EntryRating);
		const comments = form.comments.trim() === "" ? null : form.comments.trim();
		const result = await addEntry({
			title: form.title.trim(),
			rating,
			status: form.status,
			score: Number(form.score),
			duration: Number(form.duration),
			interest: form.interest,
			comments,
		});
		onSubmitted?.(result);
		if (bulk) {
			form.title = "";
			form.rating = "";
			form.comments = "";
		} else {
			form = { ...DEFAULT_FORM };
			open = false;
		}
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
			{#if bulk}
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
			<Dialog.Footer class="!flex-row !justify-between">
				<Label class="flex items-center gap-2">
					Bulk
					<Switch bind:checked={bulk} size="sm" />
				</Label>
				<Button type="submit" disabled={!canSubmit || submitting}>
					{submitting ? "Adding..." : bulk ? "Add & next" : "Add"}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
