export interface Backlog {
    id: number;
    name: string;
}

export enum EntryStatus {
	Pending = 'pending',
	Started = 'started',
	Dropped = 'dropped',
	Finished = 'finished',
}

export enum EntryInterest {
	Low = 'low',
	Neutral = 'neutral',
	High = 'high'
}

export interface EntryRow {
    id: number;
    backlog_id: number;
    title: string;
    status: EntryStatus;

    score: number;
    duration: number;
	interest: EntryInterest;

    created_at: number; 
    started_at: number | null;
    finished_at: number | null;

    ranking: number | null;
    rating: number;
    review: string;
}
