import { type DbEntry, type EntryStatus, INTEREST_MULTIPLIER } from "./db";

export type Entry = DbEntry & { priority?: number };

const INACTIVE: ReadonlySet<EntryStatus> = new Set([
	"finished",
	"dropped",
	"completed",
]);

function rawScore(e: DbEntry): number {
	return (e.score / e.duration) * INTEREST_MULTIPLIER[e.interest];
}

export function prioritize(entries: DbEntry[]): Entry[] {
	const activeScores = entries
		.filter((e) => !INACTIVE.has(e.status))
		.map(rawScore);
	const min = activeScores.length ? Math.min(...activeScores) : 0;
	const max = activeScores.length ? Math.max(...activeScores) : 0;
	const span = max - min;
	return entries.map((e) => ({
		...e,
		priority: INACTIVE.has(e.status)
			? undefined
			: span === 0
				? 100
				: Math.round(((rawScore(e) - min) / span) * 100),
	}));
}
