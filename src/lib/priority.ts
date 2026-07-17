import type { DbEntry } from "./db";

export type Entry = DbEntry & { priority: number };

export function prioritize(entries: DbEntry[]): { rows: Entry[] } {
	if (entries.length === 0) return { rows: [] };
	const raws = entries.map((e) => e.score / e.duration);
	const min = Math.min(...raws);
	const max = Math.max(...raws);
	const span = max - min;
	const rows = entries
		.map((e, i) => ({
			...e,
			priority: Math.round(span === 0 ? 100 : ((raws[i] - min) / span) * 100),
		}))
		.sort((a, b) => b.priority - a.priority);
	return { rows };
}
