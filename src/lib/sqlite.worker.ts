import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { sql } from './sql';

let db: any = null;

const init = async () => {
    const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
    });

    try {
        if ('opfs' in sqlite3) {
            db = new sqlite3.oo1.OpfsDb('/backlog.sqlite3');
            console.log('Worker: DB OPFS connected succesfull');
        } else {
            db = new sqlite3.oo1.DB('/backlog.sqlite3', 'ct');
            console.warn('Worker: Fallback to memory (no persitent)');
        }

        db.exec(sql`
			PRAGMA foreign_keys = ON;

			CREATE TABLE IF NOT EXISTS backlogs (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				duration_unit TEXT DEFAULT 'minutes'
			);

            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
				backlog_id INTEGER NOT NULL,
				FOREIGN KEY (backlog_id) REFERENCES backlogs(id) ON DELETE CASCADE,

				-- Fields
                title TEXT NOT NULL,
                score INTEGER NOT NULL DEFAULT 1,
                duration INTEGER NOT NULL DEFAULT 1,
                status TEXT CHECK(status IN ('pending', 'started', 'dropped', 'finished', 'completed')) DEFAULT 'pending',

				-- Dates
                created_at INTEGER DEFAULT (unixepoch()),
                started_at INTEGER DEFAULT NULL,
                finished_at INTEGER DEFAULT NULL,

				-- Evaluation
				ranking REAL DEFAULT NULL,
                rating INTEGER CHECK(rating BETWEEN 0 AND 10) DEFAULT 5,
				review TEXT DEFAULT ''
            );

			CREATE INDEX IF NOT EXISTS idx_entries_backlog ON entries(backlog_id);
			CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
			CREATE INDEX IF NOT EXISTS idx_entries_ranking ON entries(ranking ASC);
        `);

        postMessage({ type: 'READY' });
    } catch (e) {
        console.error('Worker: Error starting DB', e);
        postMessage({ type: 'ERROR', error: e });
    }
};

onmessage = async (event) => {
    if (event.data.type === 'INIT') {
        await init();
        return;
    }

    if (!db) {
        postMessage({ type: 'ERROR', error: 'DB not initialized' });
        return;
    }

    const { id, type, sql, bind } = event.data;

    try {
        if (type === 'EXEC') {
            const result = db.exec({
                sql: sql,
                bind: bind,
                returnValue: 'resultRows',
                rowMode: 'object'
            });
            postMessage({ id, result });
        }
    } catch (err: any) {
        postMessage({ id, error: err.message });
    }
};
