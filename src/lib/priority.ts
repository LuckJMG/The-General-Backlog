import type { DbEntry, EntryInterest, EntryStatus } from "./db";

export type Entry = DbEntry & { priority?: number };

const INACTIVE: ReadonlySet<EntryStatus> = new Set([
	"finished",
	"dropped",
	"completed",
]);

const INTEREST_MULTIPLIER: Record<EntryInterest, number> = {
	neutral: 1.0,
	high: 1.2,
	low: 0.8,
};

export function prioritize(entries: DbEntry[]): Entry[] {
	const ranked = entries.filter((e) => !INACTIVE.has(e.status));
	let min = Infinity;
	let max = -Infinity;
	for (const e of ranked) {
		const p = (e.score / e.duration) * INTEREST_MULTIPLIER[e.interest];
		if (p < min) min = p;
		if (p > max) max = p;
	}
	const span = max - min;
	return entries.map((e) => {
		if (INACTIVE.has(e.status)) return { ...e, priority: undefined };
		const p = (e.score / e.duration) * INTEREST_MULTIPLIER[e.interest];
		return {
			...e,
			priority: span === 0 ? 100 : Math.round(((p - min) / span) * 100),
		};
	});
}
