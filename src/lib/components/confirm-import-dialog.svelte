<script lang="ts">
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

type Props = {
	path: string | null;
	open: boolean;
	onConfirm: () => void;
	onOpenChange?: (open: boolean) => void;
};

let {
	path,
	open = $bindable(false),
	onConfirm,
	onOpenChange,
}: Props = $props();
</script>

<AlertDialog.Root bind:open {onOpenChange}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Replace all entries?</AlertDialog.Title>
			<AlertDialog.Description>
				All current entries will be permanently replaced with the contents of
				<span class="italic font-medium">{path ?? "the selected file"}</span>.
				<span class="font-bold">This cannot be undone.</span>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				variant="destructive"
				class="bg-red-600 hover:bg-red-700 text-white"
				onclick={() => {
					onConfirm();
					open = false;
				}}
			>
				Replace
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
