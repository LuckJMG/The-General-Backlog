<script lang="ts">
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import type { DbEntry } from "$lib/db";

type Props = {
	entry: DbEntry | null;
	open: boolean;
	onConfirm: (id: number) => void;
	onOpenChange?: (open: boolean) => void;
};

let {
	entry,
	open = $bindable(false),
	onConfirm,
	onOpenChange,
}: Props = $props();
</script>

<AlertDialog.Root bind:open {onOpenChange}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete entry?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if entry}
					<span class="italic">"{entry.title}"</span> will
					permanently be removed. <span class="font-bold">This cannot be undone.</span>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				variant="destructive"
				class="bg-red-600 hover:bg-red-700 text-white"
				onclick={() => {
					if (entry) onConfirm(entry.id);
				}}
			>
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
