<script lang="ts">
import { type DbEntry, updateEntry } from "$lib/db";
import EntryDialog from "./entry-dialog.svelte";

type Props = {
	entry: DbEntry | null;
	onUpdated: (entry: DbEntry) => void;
	onClose: () => void;
};

let { entry, onUpdated, onClose }: Props = $props();
</script>

<EntryDialog
	{entry}
	submitLabel="Save"
	submittingLabel="Saving..."
	dialogTitle="Edit Entry"
	onSubmit={(t, s, d) => updateEntry(entry!.id, t, s, d)}
	onSubmitted={onUpdated}
	{onClose}
/>
