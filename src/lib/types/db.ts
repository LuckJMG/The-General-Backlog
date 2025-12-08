export interface Backlog {
    id: number;
    name: string;
}

export enum EntryStatus {
	Pending,
	Started,
	Dropped,
	Finished,
	Completed
}

export interface EntryRow {
    id: number;
    backlog_id: number;
    title: string;
    status: EntryStatus;

    score: number;
    duration: number;

    created_at: number; 
    started_at: number | null;
    finished_at: number | null;

    ranking: number | null;
    rating: number;
    review: string;
}
