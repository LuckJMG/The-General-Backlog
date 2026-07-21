<script lang="ts">
import InterestBadge from "$lib/components/interest-badge.svelte";
import RatingBadge from "$lib/components/rating-badge.svelte";
import StatusBadge from "$lib/components/status-badge.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import {
	type DbEntry,
	ENTRY_INTERESTS,
	ENTRY_STATUSES,
	type EntryInterest,
	type EntryRating,
	type EntryStatus,
	RATING_VALUES,
} from "$lib/db";

type Props = {
	entry: DbEntry | null;
	onSubmit: (
		title: string,
		rating: EntryRating | null,
		status: EntryStatus,
		score: number,
		duration: number,
		interest: EntryInterest,
	) => Promise<DbEntry>;
	submitLabel: string;
	submittingLabel: string;
	dialogTitle: string;
	open?: boolean;
	showRating?: boolean;
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
	onSubmitted,
	onClose,
}: Props = $props();

let form = $state({
	title: "",
	rating: "",
	status: "pending" as EntryStatus,
	interest: "neutral" as EntryInterest,
	score: "",
	duration: "",
});
let submitting = $state(false);

$effect(() => {
	if (entry) {
		form.title = entry.title;
		form.rating = entry.rating == null ? "" : String(entry.rating);
		form.status = entry.status;
		form.interest = entry.interest;
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
		const rating: EntryRating | null =
			form.rating === "" ? null : (Number(form.rating) as EntryRating);
		const result = await onSubmit(
			form.title.trim(),
			rating,
			form.status,
			Number(form.score),
			Number(form.duration),
			form.interest,
		);
		onSubmitted?.(result);
		form = {
			title: "",
			rating: "",
			status: "pending",
			interest: "neutral",
			score: "",
			duration: "",
		};
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
					<Label for="entry-status">Status</Label>
					<Select.Root type="single" bind:value={form.status}>
						<Select.Trigger id="entry-status" class="w-full">
							<StatusBadge status={form.status} />
						</Select.Trigger>
						<Select.Content>
							{#each ENTRY_STATUSES as status (status)}
								<Select.Item value={status} label={status}>
									<StatusBadge {status} />
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="entry-interest">Interest</Label>
					<Select.Root type="single" bind:value={form.interest}>
						<Select.Trigger id="entry-interest" class="w-full">
							<InterestBadge interest={form.interest} />
						</Select.Trigger>
						<Select.Content>
							{#each ENTRY_INTERESTS as interest (interest)}
								<Select.Item value={interest} label={interest}>
									<InterestBadge {interest} />
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
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
				<div class="flex flex-col gap-2">
					<Label for="entry-rating">Rating</Label>
					<Select.Root type="single" bind:value={form.rating}>
						<Select.Trigger id="entry-rating" class="w-full">
							{#if form.rating === ""}
								<span class="text-muted-foreground">-</span>
							{:else}
								<RatingBadge rating={Number(form.rating) as EntryRating} />
							{/if}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="" label="-">
								<span class="text-muted-foreground">-</span>
							</Select.Item>
							{#each RATING_VALUES as rating (rating)}
								<Select.Item value={String(rating)} label={String(rating)}>
									<RatingBadge {rating} />
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
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
