import { invoke } from "@tauri-apps/api/core";

export const ENTRY_STATUSES = [
	"pending",
	"active",
	"dropped",
	"finished",
	"completed",
] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const ENTRY_INTERESTS = ["neutral", "high", "low"] as const;

export type EntryInterest = (typeof ENTRY_INTERESTS)[number];

export const RATING_VALUES = [1, 2, 3, 4, 5, 6, 7] as const;

export type EntryRating = (typeof RATING_VALUES)[number];

export const STATUS_RANK: Record<EntryStatus, number> = {
	pending: 0,
	active: 1,
	dropped: 2,
	finished: 3,
	completed: 4,
};

export const INTEREST_RANK: Record<EntryInterest, number> = {
	high: 0,
	neutral: 1,
	low: 2,
};

export const INTEREST_MULTIPLIER: Record<EntryInterest, number> = {
	neutral: 1.0,
	high: 1.2,
	low: 0.8,
};

export type EntryInput = {
	title: string;
	rating: EntryRating | null;
	status: EntryStatus;
	score: number;
	duration: number;
	interest: EntryInterest;
	comments: string | null;
};

export type DbEntry = EntryInput & { id: number };

export async function initDb() {
	await invoke("init_db");
}

export async function listEntries(): Promise<DbEntry[]> {
	return invoke<DbEntry[]>("list_entries");
}

export async function addEntry(input: EntryInput): Promise<DbEntry> {
	return invoke<DbEntry>("add_entry", { input });
}

export async function updateEntry(
	id: number,
	input: EntryInput,
): Promise<DbEntry> {
	return invoke<DbEntry>("update_entry", { id, input });
}

export async function deleteEntry(id: number): Promise<void> {
	await invoke("delete_entry", { id });
}

export async function importEntries(json: string): Promise<DbEntry[]> {
	return invoke<DbEntry[]>("import_entries", { json });
}

export async function exportEntries(): Promise<string> {
	return invoke<string>("export_entries");
}
