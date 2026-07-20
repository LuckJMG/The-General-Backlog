import type { DbEntry, EntryStatus } from "./db";

export type Entry = DbEntry & { priority?: number };

const INACTIVE: ReadonlySet<EntryStatus> = new Set([
	"finished",
	"dropped",
	"completed",
]);

export function prioritize(entries: DbEntry[]): Entry[] {
	const ranked = entries.filter((e) => !INACTIVE.has(e.status));
	let min = Infinity;
	let max = -Infinity;
	for (const e of ranked) {
		const p = e.score / e.duration;
		if (p < min) min = p;
		if (p > max) max = p;
	}
	const span = max - min;
	return entries.map((e) => {
		if (INACTIVE.has(e.status)) return { ...e, priority: undefined };
		const p = e.score / e.duration;
		return {
			...e,
			priority: span === 0 ? 100 : Math.round(((p - min) / span) * 100),
		};
	});
}
