import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { sql } from './index';

const INIT_QUERY = sql`
	PRAGMA foreign_keys = ON;

	CREATE TABLE IF NOT EXISTS backlogs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS entries (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		backlog_id INTEGER NOT NULL,

		-- Fields
		title TEXT NOT NULL,
		score REAL NOT NULL DEFAULT 1.0,
		duration REAL NOT NULL DEFAULT 1.0,
		interest TEXT CHECK(interest IN ('low', 'neutral', 'high')) DEFAULT 'neutral',
		status TEXT CHECK(status IN ('pending', 'started', 'dropped', 'finished')) DEFAULT 'pending',

		-- Dates
		created_at INTEGER DEFAULT (unixepoch()),
		started_at INTEGER DEFAULT NULL,
		finished_at INTEGER DEFAULT NULL,

		-- Evaluation
		ranking REAL DEFAULT NULL,
		rating INTEGER CHECK(rating BETWEEN 0 AND 10) DEFAULT 5,
		review TEXT DEFAULT '',

		FOREIGN KEY (backlog_id) REFERENCES backlogs(id) ON DELETE CASCADE
	);

	CREATE INDEX IF NOT EXISTS idx_entries_backlog ON entries(backlog_id);
	CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
	CREATE INDEX IF NOT EXISTS idx_entries_ranking ON entries(ranking ASC);
`

let db: any = null;

async function initWorker() {
    const SQLITE = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
    });

    try {
        if ('opfs' in SQLITE) {
            db = new SQLITE.oo1.OpfsDb('/backlog.sqlite3');
            console.log('Worker: DB OPFS connected succesfull');
        } else {
            db = new SQLITE.oo1.DB('/backlog.sqlite3', 'ct');
            console.warn('Worker: Fallback to memory (no persitent)');
        }

        db.exec(INIT_QUERY);

        postMessage({ type: 'READY' });
    } catch (e) {
        console.error('Worker: Error starting DB', e);
        postMessage({ type: 'ERROR', error: e });
    }
};

onmessage = async (event) => {
    if (event.data.type === 'INIT') {
        await initWorker();
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
