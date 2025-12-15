import { sql, query } from '$lib/db';
import { type EntryRow, EntryStatus, EntryInterest } from './types/db';
import {
	type Entry,
	type EntryInput,
	type PaginatedResult,
	SORT_MAPPING
} from './types/domain';
import { mapEntry } from './utils/mappers';

export const getEntries = async (
	backlogId: number,
	page: number = 1,
	pageSize: number = 10,
	sortBy: string = 'priority',
	sortDir: 'asc' | 'desc' = 'desc'
): Promise<PaginatedResult<Entry>> => {
	let offset = (page - 1) * pageSize;

	let dbColumn = SORT_MAPPING[sortBy] || 'normalized_priority';
	let dbDirection = sortDir === 'asc' ? 'ASC' : 'DESC';

    let rows = await query(sql`
        WITH raw_data AS (
            SELECT
                *,
                -- Priority
                (CAST(score AS REAL) / NULLIF(duration, 0)) * CASE interest 
                    WHEN 'high' THEN 1.25
                    WHEN 'low' THEN 0.75
                    ELSE 1.0
                END as priority
            FROM entries
            WHERE backlog_id = ?
        ),
        stats AS (
            -- Get priority limits
            SELECT MIN(priority) as min_priority, MAX(priority) as max_priority
            FROM raw_data
        )
        SELECT 
            r.*,
            -- Normalization
            CASE 
                WHEN s.max_priority = s.min_priority THEN 100 -- Avoid division by 0 with one item
                ELSE ((r.priority - s.min_priority) / (s.max_priority - s.min_priority)) * 100
            END as normalized_priority,

			COUNT(*) OVER() as total_count
        FROM raw_data r, stats s
        ORDER BY ${dbColumn} ${dbDirection}
		LIMIT ? OFFSET ?
    `, [backlogId, pageSize, offset]) as (EntryRow & { normalized_priority: number, total_count: number })[];

    let entries = rows.map(row => mapEntry(row, row.normalized_priority));
	let total = rows.length > 0 ? rows[0].total_count : 0;

	return {
		data: entries,
		total,
		page,
		pageSize
	}
};

export const getRanking = async (backlogId: number): Promise<Entry[]> => {
    const rows = await query(sql`
        SELECT * FROM entries 
        WHERE backlog_id = ? 
        AND status = 'finished'
        ORDER BY ranking ASC
    `, [backlogId]) as EntryRow[];

    return rows.map(mapEntry);
};

export const createEntry = async (backlogId: number, entry: EntryInput): Promise<Entry> => {
    const rows = await query(sql`
        INSERT INTO entries (backlog_id, title, score, duration)
        VALUES (?, ?, ?, ?)
        RETURNING *
    `, [backlogId, entry.title, entry.score, entry.duration]) as EntryRow[];

    return mapEntry(rows[0]);
};

export const updateEntry = async (
    id: number, 
    entry: Partial<EntryInput> & { 
        interest?: EntryInterest; 
        rating?: number; 
        review?: string; 
        ranking?: number;
        createdAt?: Date;
        startedAt?: Date | null;
        finishedAt?: Date | null;
    }
): Promise<void> => {
    const updates: string[] = [];
    const values: any[] = [];

    if (entry.title !== undefined) { updates.push("title = ?"); values.push(entry.title); }
    if (entry.score !== undefined) { updates.push("score = ?"); values.push(entry.score); }
    if (entry.duration !== undefined) { updates.push("duration = ?"); values.push(entry.duration); }
    if (entry.interest !== undefined) { updates.push("interest = ?"); values.push(entry.interest); }
    if (entry.rating !== undefined) { updates.push("rating = ?"); values.push(entry.rating); }
    if (entry.review !== undefined) { updates.push("review = ?"); values.push(entry.review); }
    if (entry.ranking !== undefined) { updates.push("ranking = ?"); values.push(entry.ranking); }

    if (entry.createdAt !== undefined) { 
        updates.push("created_at = ?"); 
        values.push(Math.floor(entry.createdAt.getTime() / 1000)); 
    }

    if (entry.startedAt !== undefined) { 
        updates.push("started_at = ?"); 
        values.push(entry.startedAt ? Math.floor(entry.startedAt.getTime() / 1000) : null); 
    }

    if (entry.finishedAt !== undefined) { 
        updates.push("finished_at = ?"); 
        values.push(entry.finishedAt ? Math.floor(entry.finishedAt.getTime() / 1000) : null); 
    }

    if (updates.length === 0) return;

    values.push(id);

    await query(`UPDATE entries SET ${updates.join(', ')} WHERE id = ?`, values);
};

export const updateEntryStatus = async (id: number, newStatus: EntryStatus): Promise<void> => {
    let update = "";

    if (newStatus === EntryStatus.Started) {
        update = ", started_at = COALESCE(started_at, unixepoch())";
    } else if (newStatus === EntryStatus.Finished) {
        update = ", finished_at = unixepoch()";
    }

    await query(`
        UPDATE entries 
        SET status = ? ${update}
        WHERE id = ?
    `, [newStatus, id]);
};

export const deleteEntry = async (id: number): Promise<void> => {
    await query(sql`DELETE FROM entries WHERE id = ?`, [id]);
};

