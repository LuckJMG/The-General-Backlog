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

export const RATING_LABELS: Record<EntryRating, string> = {
	1: "Blasphemy",
	2: "Horrible",
	3: "Bad",
	4: "Neutral",
	5: "Good",
	6: "Excellent",
	7: "Masterpiece",
};

export type DbEntry = {
	id: number;
	title: string;
	rating: EntryRating | null;
	status: EntryStatus;
	score: number;
	duration: number;
	interest: EntryInterest;
	comments: string | null;
};

export async function initDb() {
	await invoke("init_db");
}

export async function listEntries(): Promise<DbEntry[]> {
	return invoke<DbEntry[]>("list_entries");
}

export async function addEntry(
	title: string,
	rating: EntryRating | null,
	status: EntryStatus,
	score: number,
	duration: number,
	interest: EntryInterest,
	comments: string | null,
): Promise<DbEntry> {
	return invoke<DbEntry>("add_entry", {
		title,
		rating,
		status,
		score,
		duration,
		interest,
		comments,
	});
}

export async function updateEntry(
	id: number,
	title: string,
	rating: EntryRating | null,
	status: EntryStatus,
	score: number,
	duration: number,
	interest: EntryInterest,
	comments: string | null,
): Promise<DbEntry> {
	return invoke<DbEntry>("update_entry", {
		id,
		title,
		rating,
		status,
		score,
		duration,
		interest,
		comments,
	});
}

export async function deleteEntry(id: number): Promise<void> {
	await invoke("delete_entry", { id });
}
