use rusqlite::{params, Connection};
use serde::Serialize;
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct Db(pub Mutex<Connection>);

#[derive(Serialize)]
pub struct Entry {
    pub id: i64,
    pub name: String,
    pub score: f64,
    pub duration: i64,
}

const SCHEMA: &str = "CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score REAL NOT NULL,
    duration INTEGER NOT NULL
)";

const SEED: &[(&str, f64, i64)] = &[
    ("The Pragmatic Programmer", 8.4, 12),
    ("Disco Elysium", 9.1, 25),
    ("Dune: Part Two", 8.0, 3),
    ("Hades", 8.7, 30),
    ("Project Hail Mary", 8.6, 16),
];

#[tauri::command]
pub fn init_db(db: State<'_, Db>) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute_batch(SCHEMA).map_err(|e| e.to_string())?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM entries", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    if count == 0 {
        for (name, score, duration) in SEED {
            conn.execute(
                "INSERT INTO entries (name, score, duration) VALUES (?1, ?2, ?3)",
                params![*name, *score, *duration],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn list_entries(db: State<'_, Db>) -> Result<Vec<Entry>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, score, duration FROM entries")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |r| {
            Ok(Entry {
                id: r.get(0)?,
                name: r.get(1)?,
                score: r.get(2)?,
                duration: r.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

pub fn open(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&dir)?;
    let conn = Connection::open(dir.join("backlog.db"))?;
    app.manage(Db(Mutex::new(conn)));
    Ok(())
}
