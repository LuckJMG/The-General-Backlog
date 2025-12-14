import type { EntryStatus, EntryInterest } from './db';

export interface Entry {
    id: number;
    title: string;
    status: EntryStatus;

    // Priority
    score: number;
    duration: number;
	interest: EntryInterest;
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

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
}

export const SORT_MAPPING: Record<string, string> = {
    title: 'title',
    status: 'status',
    score: 'score',
    duration: 'duration',
    interest: 'interest',
    priority: 'normalized_priority'
};

