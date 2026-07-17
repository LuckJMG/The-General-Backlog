<script lang="ts">
import PlusIcon from "@lucide/svelte/icons/plus";
import { Button } from "$lib/components/ui/button/index.js";
import { addEntry, type DbEntry } from "$lib/db";
import EntryDialog from "./entry-dialog.svelte";

type Props = {
	onAdded: (entry: DbEntry) => void;
};

let { onAdded }: Props = $props();
</script>

<EntryDialog
	entry={null}
	submitLabel="Add"
	submittingLabel="Adding..."
	dialogTitle="New Entry"
	onSubmit={addEntry}
	onSubmitted={onAdded}
>
	{#snippet trigger({ props })}
		<Button variant="outline" {...props}>
			<PlusIcon />
			Add entry
		</Button>
	{/snippet}
</EntryDialog>
