import { sql, query } from '$lib/database';
import { type Backlog } from '$lib/database/types';

export const getBacklogs = async (): Promise<Backlog[]> => {
    return await query(sql`
        SELECT id, name 
        FROM backlogs 
        ORDER BY id ASC
    `) as Backlog[];
};

export const createBacklog = async (name: string): Promise<number> => {
    const rows = await query(sql`
        INSERT INTO backlogs (name) 
        VALUES (?) 
        RETURNING id
    `, [name]) as { id: number }[];

    return rows[0].id;
};

export const updateBacklog = async (id: number, name: string): Promise<void> => {
    await query(sql`
        UPDATE backlogs 
        SET name = ? 
        WHERE id = ?
    `, [name, id]);
};

export const deleteBacklog = async (id: number): Promise<void> => {
    await query(sql`
        DELETE FROM backlogs 
        WHERE id = ?
    `, [id]);
};

