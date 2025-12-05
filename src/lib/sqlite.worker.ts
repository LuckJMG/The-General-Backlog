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
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
                created_at INTEGER DEFAULT (unixepoch())
            );
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
