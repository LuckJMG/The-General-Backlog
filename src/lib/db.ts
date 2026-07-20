import { invoke } from "@tauri-apps/api/core";

export const ENTRY_STATUSES = [
	"pending",
	"active",
	"dropped",
	"finished",
	"completed",
] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export type DbEntry = {
	id: number;
	title: string;
	status: EntryStatus;
	score: number;
	duration: number;
};

export async function initDb() {
	await invoke("init_db");
}

export async function listEntries(): Promise<DbEntry[]> {
	return invoke<DbEntry[]>("list_entries");
}

export async function addEntry(
	title: string,
	status: EntryStatus,
	score: number,
	duration: number,
): Promise<DbEntry> {
	return invoke<DbEntry>("add_entry", { title, status, score, duration });
}

export async function updateEntry(
	id: number,
	title: string,
	status: EntryStatus,
	score: number,
	duration: number,
): Promise<DbEntry> {
	return invoke<DbEntry>("update_entry", {
		id,
		title,
		status,
		score,
		duration,
	});
}

export async function deleteEntry(id: number): Promise<void> {
	await invoke("delete_entry", { id });
}
