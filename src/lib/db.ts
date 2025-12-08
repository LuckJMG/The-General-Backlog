interface WorkerMessage {
    id: number;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

let worker: Worker | null = null;
let messageId = 0;
const pendingMessages = new Map<number, WorkerMessage>();

export const sql = (strings: TemplateStringsArray, ...values: any[]) => 
    String.raw({ raw: strings }, ...values);

export const initDB = async () => {
    if (worker) return;

    const WorkerClass = (await import('$lib/sqlite.worker?worker')).default;
    worker = new WorkerClass();

    worker.onmessage = (event) => {
        const { id, result, error, type } = event.data;

        if (type === 'READY') {
            console.log('DB System ready');
            return;
        }

        const pending = pendingMessages.get(id);
        if (pending) {
            if (error) pending.reject(error);
            else pending.resolve(result);
            pendingMessages.delete(id);
        }
    };

    worker.postMessage({ type: 'INIT' });
    
    await new Promise(r => setTimeout(r, 500)); 
};

export const query = async (sql: string, bind: any[] = []) => {
    if (!worker) await initDB();
    
    return new Promise((resolve, reject) => {
        const id = messageId++;
        pendingMessages.set(id, { id, resolve, reject });
        worker!.postMessage({ type: 'EXEC', id, sql, bind });
    });
};
