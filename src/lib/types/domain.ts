import type { EntryStatus } from './db.types';

export interface Entry {
    id: number;
    title: string;
    status: EntryStatus;

    // Priority
    score: number;
    duration: number;
    priority: number;

    // Dates
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;

	// Evaluation
    ranking: number | null;
    rating: number;
    review: string;
}

export interface EntryInput {
    title: string;
    score: number;
    duration: number;
}

