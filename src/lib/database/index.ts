interface WorkerMessage {
    id: number;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

let worker: Worker | null = null;
let messageId = 0;
let pendingMessages = new Map<number, WorkerMessage>();

export function sql(strings: TemplateStringsArray, ...values: any[]) {
    return String.raw({ raw: strings }, ...values);
}

export async function query(sql: string, bind: any[] = []) {
    if (!worker) await initDB();

    return new Promise((resolve, reject) => {
        const id = messageId++;
        pendingMessages.set(id, { id, resolve, reject });
        worker!.postMessage({ type: 'EXEC', id, sql, bind });
    });
};

async function initDB() {
    if (worker) return;

    const WorkerClass = (await import('$lib/database/sqlite.worker?worker')).default;
    worker = new WorkerClass();

    worker.onmessage = (event) => {
        const { id, result, error, type } = event.data;

        if (type === 'READY') {
            console.log('DB System ready');
            return;
        }

        let pending = pendingMessages.get(id);
        if (pending) {
            if (error) pending.reject(error);
            else pending.resolve(result);
            pendingMessages.delete(id);
        }
    };

    worker.postMessage({ type: 'INIT' });

    await new Promise(res => setTimeout(res, 500)); 
};

