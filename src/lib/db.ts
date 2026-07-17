import { invoke } from "@tauri-apps/api/core";

export type DbEntry = {
	id: number;
	title: string;
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
	score: number,
	duration: number,
): Promise<DbEntry> {
	return invoke<DbEntry>("add_entry", { title, score, duration });
}

export async function updateEntry(
	id: number,
	title: string,
	score: number,
	duration: number,
): Promise<DbEntry> {
	return invoke<DbEntry>("update_entry", { id, title, score, duration });
}

export async function deleteEntry(id: number): Promise<void> {
	await invoke("delete_entry", { id });
}
