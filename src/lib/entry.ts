import { sql, query } from '$lib/db';
import { type EntryRow } from './types/db';
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
	sortDir: 'asc' | 'desc' = 'desc',
	search: string = ''
): Promise<PaginatedResult<Entry>> => {
	let offset = (page - 1) * pageSize;

	let dbColumn = SORT_MAPPING[sortBy] || 'normalized_priority';
	let dbDirection = sortDir === 'asc' ? 'ASC' : 'DESC';

	let whereClause = 'backlog_id = ?';
	let params: any[] = [backlogId];

	if (search) {
		whereClause += ' AND title LIKE ?';
		params.push(`%${search}%`);
	}
	
	params.push(pageSize, offset);

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
            WHERE ${whereClause}
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
    `, params) as (EntryRow & { normalized_priority: number, total_count: number })[];

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
    const columns = ['backlog_id', 'title', 'score', 'duration'];
    const values: any[] = [backlogId, entry.title, entry.score, entry.duration];

    if (entry.interest) { columns.push('interest'); values.push(entry.interest); }
    if (entry.status) { columns.push('status'); values.push(entry.status); }
    if (entry.review) { columns.push('review'); values.push(entry.review); }
    if (entry.rating !== undefined) { columns.push('rating'); values.push(entry.rating); }

    if (entry.createdAt) { 
        columns.push('created_at'); 
        values.push(Math.floor(entry.createdAt.getTime() / 1000)); 
    }
    if (entry.startedAt) { 
        columns.push('started_at'); 
        values.push(Math.floor(entry.startedAt.getTime() / 1000)); 
    }
    if (entry.finishedAt) { 
        columns.push('finished_at'); 
        values.push(Math.floor(entry.finishedAt.getTime() / 1000)); 
    }

    const placeholders = values.map(() => '?').join(', ');
    const colStr = columns.join(', ');

    const rows = await query(`
        INSERT INTO entries (${colStr})
        VALUES (${placeholders})
        RETURNING *
    `, values) as EntryRow[];

    return mapEntry(rows[0]);
};

export const updateEntry = async (
    id: number, 
    entry: Partial<EntryInput> & { 
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
    if (entry.status !== undefined) { updates.push("status = ?"); values.push(entry.status); }
    if (entry.rating !== undefined) { updates.push("rating = ?"); values.push(entry.rating); }
    if (entry.review !== undefined) { updates.push("review = ?"); values.push(entry.review); }

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

export const deleteEntry = async (id: number): Promise<void> => {
    await query(sql`DELETE FROM entries WHERE id = ?`, [id]);
};

