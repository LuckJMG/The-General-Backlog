import type { DbEntry } from "./db";

export type Entry = DbEntry & { priority: number };

export function prioritize(entries: DbEntry[]): {
	rows: Entry[];
	min: number;
	max: number;
} {
	if (entries.length === 0) return { rows: [], min: 0, max: 0 };
	const rows = entries
		.map((e) => ({ ...e, priority: e.score / e.duration }))
		.sort((a, b) => b.priority - a.priority);
	const raws = rows.map((r) => r.priority);
	return { rows, min: Math.min(...raws), max: Math.max(...raws) };
}
