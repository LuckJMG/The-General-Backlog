import { invoke } from "@tauri-apps/api/core";

export type DbEntry = {
	id: number;
	name: string;
	score: number;
	duration: number;
};

export async function initDb() {
	await invoke("init_db");
}

export async function listEntries(): Promise<DbEntry[]> {
	return invoke<DbEntry[]>("list_entries");
}
