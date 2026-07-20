import type { DbEntry } from "./db";

export type Entry = DbEntry & { priority: number };

export function prioritize(entries: DbEntry[]): Entry[] {
	const rows = entries.map((e) => ({ ...e, priority: e.score / e.duration }));
	let min = Infinity;
	let max = -Infinity;
	for (const row of rows) {
		if (row.priority < min) min = row.priority;
		if (row.priority > max) max = row.priority;
	}
	const span = max - min;
	for (const row of rows) {
		row.priority =
			span === 0 ? 100 : Math.round(((row.priority - min) / span) * 100);
	}
	return rows;
}
