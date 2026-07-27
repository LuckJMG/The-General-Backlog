<script lang="ts">
import DownloadIcon from "@lucide/svelte/icons/download";
import UploadIcon from "@lucide/svelte/icons/upload";
import { open as openFileDialog, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import ConfirmImportDialog from "$lib/components/confirm-import-dialog.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { type DbEntry, exportEntries, importEntries } from "$lib/db";

type Props = {
	open?: boolean;
	onReplaced?: (entries: DbEntry[]) => void;
};

let { open = $bindable(false), onReplaced }: Props = $props();

let busy = $state(false);
let error = $state<string | null>(null);
let importConfirmOpen = $state(false);
let pendingImportPath = $state<string | null>(null);

async function exportJson() {
	error = null;
	busy = true;
	try {
		const path = await save({
			defaultPath: "backlog.json",
			filters: [{ name: "JSON", extensions: ["json"] }],
		});
		if (!path) return;
		await writeTextFile(path, await exportEntries());
		open = false;
	} catch (e) {
		error = e instanceof Error ? e.message : String(e);
	} finally {
		busy = false;
	}
}

async function pickImportFile() {
	error = null;
	try {
		const picked = await openFileDialog({
			multiple: false,
			filters: [{ name: "JSON", extensions: ["json"] }],
		});
		if (!picked || Array.isArray(picked)) return;
		pendingImportPath = picked;
		importConfirmOpen = true;
	} catch (e) {
		error = e instanceof Error ? e.message : String(e);
	}
}

async function runImport() {
	if (!pendingImportPath) return;
	busy = true;
	try {
		const text = await readTextFile(pendingImportPath);
		const result = await importEntries(text);
		onReplaced?.(result);
		pendingImportPath = null;
		open = false;
	} catch (e) {
		error = e instanceof Error ? e.message : String(e);
	} finally {
		busy = false;
	}
}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col gap-3">
			<Button
				variant="outline"
				disabled={busy}
				onclick={exportJson}
				class="h-auto py-4 justify-start"
			>
				<DownloadIcon />
				<div class="flex flex-col items-start text-left">
					<span class="font-medium">Export JSON</span>
					<span class="text-xs text-muted-foreground font-normal">
						Save all entries to a file
					</span>
				</div>
			</Button>
			<Button
				variant="outline"
				disabled={busy}
				onclick={pickImportFile}
				class="h-auto py-4 justify-start"
			>
				<UploadIcon />
				<div class="flex flex-col items-start text-left">
					<span class="font-medium">Import JSON</span>
					<span class="text-xs text-muted-foreground font-normal">
						Replace all entries with the contents of a file
					</span>
				</div>
			</Button>
			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<ConfirmImportDialog
	bind:open={importConfirmOpen}
	path={pendingImportPath}
	onConfirm={runImport}
	onOpenChange={(o) => {
		if (!o) pendingImportPath = null;
	}}
/>
