<script lang="ts">
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Textarea } from "$lib/components/ui/textarea";
import { Slider } from "$lib/components/ui/slider";
import { Label } from "$lib/components/ui/label";
import * as Dialog from "$lib/components/ui/dialog";
import * as ButtonGroup from "$lib/components/ui/button-group";
import DatePicker from "./date-picker.svelte";

import Plus from "@lucide/svelte/icons/plus";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import ChevronUp from "@lucide/svelte/icons/chevron-up";
import { createEntry } from "$lib/entry";
import { invalidateAll } from "$app/navigation";
import { page } from "$app/state";
import { EntryInterest, EntryStatus } from "$lib/database/types";
import type { EntryInput } from "$lib/types/domain";

let open = $state(false);
let loading = $state(false);
let showAdvanced = $state(false);

let formData = $state<EntryInput>({
	title: "",
	score: 0,
	duration: 0,
	interest: EntryInterest.Neutral,
	status: EntryStatus.Pending,
	rating: 0,
	review: "",
	createdAt: new Date(),
	startedAt: null,
	finishedAt: null
});

let rating = $derived(formData.rating || 0);

function handleStatusChange(newStatus: EntryStatus) {
	formData.status = newStatus;
	const today = new Date();

	if (newStatus === EntryStatus.Started && !formData.startedAt) {
		formData.startedAt = today;
	} else if ((newStatus === EntryStatus.Finished || newStatus === EntryStatus.Dropped) && !formData.finishedAt) {
		formData.finishedAt = today;
	}
}

async function handleSubmit() {
	if (!formData.title.trim()) return;

	let backlogId = Number(page.url.searchParams.get('backlog')) || 1;

	formData.rating = rating;

	loading = true;
	try {
		await createEntry(backlogId, formData);
		await invalidateAll();
		open = false;
		resetForm();
	} finally {
		loading = false;
	}
}

function resetForm() {
	formData = {
		title: "",
		score: 0,
		duration: 0,
		interest: EntryInterest.Neutral,
		status: EntryStatus.Pending,
		rating: 0,
		review: "",
		createdAt: new Date(),
		startedAt: null,
		finishedAt: null
	};
	rating = 0;
	showAdvanced = false;
}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>
				<Plus class="h-4 w-4 mr-2" />
				Add Entry
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Add Entry</Dialog.Title>
			<Dialog.Description>
				Add a new item to the current backlog.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="title">Title <span class="text-destructive">*</span></Label>
				<Input id="title" bind:value={formData.title} placeholder="e.g., The Matrix" required />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="score">Score <span class="text-destructive">*</span></Label>
					<Input id="score" type="number" step="any" min="0" bind:value={formData.score} required />
				</div>
				<div class="grid gap-2">
					<Label for="duration">Duration <span class="text-destructive">*</span></Label>
					<Input id="duration" type="number" step="any" min="0" bind:value={formData.duration} required />
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

			<Button variant="ghost" size="sm" class="w-full mt-2" onclick={() => showAdvanced = !showAdvanced}>
				{#if showAdvanced}
					<ChevronUp class="h-4 w-4 mr-2" /> Hide Advanced
				{:else}
					<ChevronDown class="h-4 w-4 mr-2" /> Show Advanced
				{/if}
			</Button>

			{#if showAdvanced}
				<div class="grid gap-4 border-t pt-4">
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
							<Label for="created-at" class="text-xs">Created</Label>
							<DatePicker id="created-at" bind:value={formData.createdAt} />
						</div>
						<div class="grid gap-2">
							<Label for="started-at" class="text-xs">Started</Label>
							<DatePicker id="started-at" bind:value={formData.startedAt} />
						</div>
						<div class="grid gap-2">
							<Label for="finished-at" class="text-xs">Finished/Dropped</Label>
							<DatePicker id="finished-at" bind:value={formData.finishedAt} />
						</div>
					</div>

					<div class="grid gap-2">
						<div class="flex justify-between items-center">
							<Label>Rating</Label>
							<span class="text-sm font-medium text-muted-foreground">{rating} / 10</span>
						</div>
						<Slider type="single" bind:value={rating} max={10} step={1} class="py-2" />
					</div>

					<div class="grid gap-2">
						<Label for="review">Review</Label>
						<Textarea 
							id="review" 
							bind:value={formData.review} 
							placeholder="Detailed review..."
						/>
					</div>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => open = false}>Cancel</Button>
			<Button type="submit" onclick={handleSubmit} disabled={loading || !formData.title}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
