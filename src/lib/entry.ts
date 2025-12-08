import { sql, query } from '$lib/db';
import { type EntryRow, EntryStatus } from './types/db';
import { type Entry, type EntryInput } from './types/domain';
import { mapEntry } from './utils/mappers';

export const getEntries = async (backlogId: number): Promise<Entry[]> => {
    const rows = await query(sql`
        SELECT * FROM entries 
        WHERE backlog_id = ? 
        ORDER BY created_at DESC
    `, [backlogId]) as EntryRow[];

    return rows.map(mapEntry);
};

export const getRanking = async (backlogId: number): Promise<Entry[]> => {
    const rows = await query(sql`
        SELECT * FROM entries 
        WHERE backlog_id = ? 
        AND status IN ('finished', 'completed')
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
    } else if (newStatus === EntryStatus.Finished || newStatus === EntryStatus.Completed) {
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

