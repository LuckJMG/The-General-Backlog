import { query } from '$lib/db';

const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw({ raw: strings }, ...values);

const GAMES = [
    { title: "Hollow Knight: Silksong", score: 0, duration: 30, status: "pending" },
    { title: "Elden Ring", score: 10, duration: 120, status: "completed", review: "Obra maestra absoluta." },
    { title: "Cyberpunk 2077", score: 8, duration: 60, status: "finished" },
    { title: "Baldur's Gate 3", score: 10, duration: 150, status: "started" },
    { title: "Starfield", score: 6, duration: 40, status: "dropped", review: "Muy repetitivo." },
    { title: "Hades II", score: 9, duration: 25, status: "completed" },
    { title: "Celeste", score: 10, duration: 15, status: "completed" },
    { title: "Factorio", score: 9, duration: 500, status: "started" }
];

const MOVIES = [
    { title: "Dune: Part Two", score: 9, duration: 166, status: "completed" },
    { title: "Oppenheimer", score: 9, duration: 180, status: "finished" },
    { title: "Madame Web", score: 2, duration: 116, status: "dropped" },
    { title: "Interstellar", score: 10, duration: 169, status: "completed" }
];

const randomDate = (start: Date, end: Date) => {
    return Math.floor((start.getTime() + Math.random() * (end.getTime() - start.getTime())) / 1000);
};

export const seedDatabase = async () => {
    console.log("Generating seeding of data...");

    // 1. Clean
    await query(sql`DELETE FROM entries`);
    await query(sql`DELETE FROM backlogs`);
    await query(sql`DELETE FROM sqlite_sequence`);

    // 2. Create Backlogs
    await query(sql`INSERT INTO backlogs (id, name) VALUES (1, 'Games Backlog')`);
    await query(sql`INSERT INTO backlogs (id, name) VALUES (2, 'Movies 2025')`);
    await query(sql`INSERT INTO backlogs (id, name) VALUES (3, 'Books to Read')`);

    // 3. Insert game entries
    for (const game of GAMES) {
        await insertMockEntry(1, game);
    }

    // 4. Insert movie entries
    for (const movie of MOVIES) {
        await insertMockEntry(2, movie);
    }

    // 5. Generate bulk data
    for (let i = 1; i <= 20; i++) {
        const statusPool = ['pending', 'started', 'finished', 'completed', 'dropped'];
        const randomStatus = statusPool[Math.floor(Math.random() * statusPool.length)];

        await insertMockEntry(1, {
            title: `Generic Indie #${i}`,
            score: Math.floor(Math.random() * 10),
            duration: Math.floor(Math.random() * 50) + 1,
            status: randomStatus,
            review: Math.random() > 0.7 ? "Automatic generated review." : ""
        });
    }

    console.log("BD seed success.");
    window.location.reload(); 
};

async function insertMockEntry(backlogId: number, data: any) {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    let created_at = randomDate(threeMonthsAgo, now);
    let started_at: number | null = null;
    let finished_at: number | null = null;
    let ranking: number | null = null;

    if (data.status !== 'pending') {
        started_at = created_at + 86400; // Started 1 day after creation
    }

    if (['finished', 'completed', 'dropped'].includes(data.status)) {
        finished_at = (started_at || created_at) + (data.duration * 60); // Finished after X time
    }

    if (['finished', 'completed'].includes(data.status)) {
        ranking = Math.random() > 0.5 ? Math.floor(Math.random() * 100) / 10 : null;
    }

    await query(sql`
        INSERT INTO entries (
            backlog_id, title, score, duration, status, 
            created_at, started_at, finished_at, 
            rating, review, ranking
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        backlogId,
        data.title,
        data.score,
        data.duration,
        data.status,
        created_at,
        started_at,
        finished_at,
        data.score,
        data.review || '',
        ranking
    ]);
}
