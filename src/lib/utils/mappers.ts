import { type EntryRow } from '$lib/database/types';
import type { Entry } from '$lib/types/domain';

export const mapEntry = (row: EntryRow, preCalculatedPriority?: number): Entry => {
	return {
        id: row.id,
        title: row.title,
        status: row.status,

        score: row.score,
        duration: row.duration,
		interest: row.interest,

		priority: preCalculatedPriority ?? 0,

        createdAt: new Date(row.created_at * 1000),
        startedAt: row.started_at ? new Date(row.started_at * 1000) : null,
        finishedAt: row.finished_at ? new Date(row.finished_at * 1000) : null,

        ranking: row.ranking,
        rating: row.rating,
        review: row.review
    };
};

