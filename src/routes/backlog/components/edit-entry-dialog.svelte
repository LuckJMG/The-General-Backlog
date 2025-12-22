<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Slider } from "$lib/components/ui/slider";
	import { Label } from "$lib/components/ui/label";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import * as ButtonGroup from "$lib/components/ui/button-group";
	import DatePicker from "./date-picker.svelte";

	import { updateEntry, deleteEntry } from "$lib/entry";
	import { invalidateAll } from "$app/navigation";
	import { EntryInterest, EntryStatus } from "$lib/database/types";
	import type { Entry } from "$lib/types/domain";

	let { entry, open = $bindable(false) } = $props<{ 
		entry: Entry, 
		open: boolean 
	}>();

	let loading = $state(false);
	let alertOpen = $state(false);

	// svelte-ignore state_referenced_locally
	let formData = $state({
		title: entry.title,
		score: entry.score,
		duration: entry.duration,
		interest: entry.interest,
		status: entry.status,
		rating: entry.rating ?? 0,
		review: entry.review,
		createdAt: entry.createdAt,
		startedAt: entry.startedAt,
		finishedAt: entry.finishedAt
	});

	$effect(() => {
		formData.title = entry.title;
		formData.score = entry.score;
		formData.duration = entry.duration;
		formData.interest = entry.interest;
		formData.status = entry.status;
		formData.rating = entry.rating ?? 0;
		formData.review = entry.review;
		formData.createdAt = entry.createdAt;
		formData.startedAt = entry.startedAt;
		formData.finishedAt = entry.finishedAt;
	});

	function handleStatusChange(newStatus: EntryStatus) {
		formData.status = newStatus;
		const today = new Date();

		if (newStatus === EntryStatus.Started && !formData.startedAt) {
			formData.startedAt = today;
		} else if ((newStatus === EntryStatus.Finished || newStatus === EntryStatus.Dropped) && !formData.finishedAt) {
			formData.finishedAt = today;
		}
	}

	async function handleUpdate() {
		if (!formData.title.trim() || formData.score === null || formData.duration === null) return;

		loading = true;
		try {
			await updateEntry(entry.id, formData);
			await invalidateAll();
			open = false;
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		loading = true;
		try {
			await deleteEntry(entry.id);
			await invalidateAll();
			open = false;
			alertOpen = false;
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Edit Entry</Dialog.Title>
			<Dialog.Description>
				Edit details for "{entry.title}".
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="edit-title">Title <span class="text-destructive">*</span></Label>
				<Input id="edit-title" bind:value={formData.title} required />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="edit-score">Score <span class="text-destructive">*</span></Label>
					<Input id="edit-score" type="number" step="any" min="0" bind:value={formData.score} required />
				</div>
				<div class="grid gap-2">
					<Label for="edit-duration">Duration <span class="text-destructive">*</span></Label>
					<Input id="edit-duration" type="number" step="any" min="0" bind:value={formData.duration} required />
				</div>
			</div>

			<div class="grid gap-2">
				<Label>Interest</Label>
				<ButtonGroup.Root class="w-full">
					{#each Object.values(EntryInterest) as interest}
						<Button 
							variant={formData.interest === interest ? 'default' : 'outline'}
							onclick={() => formData.interest = interest}
							class="flex-1 capitalize"
						>
							{interest}
						</Button>
					{/each}
				</ButtonGroup.Root>
			</div>

			<div class="grid gap-2">
				<Label>Status</Label>
				<ButtonGroup.Root class="w-full flex-wrap">
					{#each Object.values(EntryStatus) as status}
						<Button 
							size="sm"
							variant={formData.status === status ? 'default' : 'outline'}
							onclick={() => handleStatusChange(status)}
							class="flex-1 capitalize min-w-20"
						>
							{status}
						</Button>
					{/each}
				</ButtonGroup.Root>
			</div>

			<div class="grid grid-cols-3 gap-2">
				<div class="grid gap-2">
					<Label for="edit-created-at" class="text-xs">Created</Label>
					<DatePicker id="edit-created-at" bind:value={formData.createdAt} />
				</div>
				<div class="grid gap-2">
					<Label for="edit-started-at" class="text-xs">Started</Label>
					<DatePicker id="edit-started-at" bind:value={formData.startedAt} />
				</div>
				<div class="grid gap-2">
					<Label for="edit-finished-at" class="text-xs">Finished/Dropped</Label>
					<DatePicker id="edit-finished-at" bind:value={formData.finishedAt} />
				</div>
			</div>

			<div class="grid gap-2">
				<div class="flex justify-between items-center">
					<Label>Rating</Label>
					<span class="text-sm font-medium text-muted-foreground">{formData.rating} / 10</span>
				</div>
				<Slider type="single" bind:value={formData.rating} max={10} step={1} class="py-2" />
			</div>

			<div class="grid gap-2">
				<Label for="edit-review">Review</Label>
				<Textarea 
					id="edit-review" 
					bind:value={formData.review} 
					placeholder="Write your review here..."
				/>
			</div>
		</div>

		<Dialog.Footer class="flex justify-between sm:justify-between">
			<AlertDialog.Root bind:open={alertOpen}>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button variant="destructive" {...props}>Delete</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Delete Entry?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. This will permanently delete 
							<span class="font-bold">"{entry.title}"</span>.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action class="bg-destructive text-white hover:bg-destructive/90" onclick={handleDelete}>
							Delete
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>

			<Button type="submit" onclick={handleUpdate} disabled={loading || !formData.title}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
