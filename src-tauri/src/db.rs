use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct Db(pub Mutex<Connection>);

#[derive(Serialize)]
pub struct Entry {
    pub id: i64,
    pub title: String,
    pub rating: Option<i64>,
    pub status: String,
    pub score: f64,
    pub duration: i64,
    pub interest: String,
    pub comments: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct EntryEnvelope {
    entries: Vec<EntryInput>,
}

#[derive(Deserialize, Serialize)]
pub struct EntryInput {
    pub title: String,
    pub rating: Option<i64>,
    pub status: String,
    pub score: f64,
    pub duration: i64,
    pub interest: String,
    pub comments: Option<String>,
}

impl EntryInput {
    fn verify(&self) -> Result<(), String> {
        if self.title.trim().is_empty() {
            return Err("title is required".to_string());
        }
        if let Some(r) = self.rating {
            if !(1..=7).contains(&r) {
                return Err(format!("invalid rating: {r}"));
            }
        }
        if !STATUSES.contains(&self.status.as_str()) {
            return Err(format!("invalid status: {}", self.status));
        }
        if self.score <= 0.0 {
            return Err("score must be positive".to_string());
        }
        if self.duration <= 0 {
            return Err("duration must be positive".to_string());
        }
        if !INTERESTS.contains(&self.interest.as_str()) {
            return Err(format!("invalid interest: {}", self.interest));
        }
        Ok(())
    }
}

const STATUSES: &[&str] = &["pending", "active", "dropped", "finished", "completed"];
const INTERESTS: &[&str] = &["neutral", "high", "low"];

const SCHEMA: &str = "CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    rating INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    score REAL NOT NULL,
    duration INTEGER NOT NULL,
    interest TEXT NOT NULL DEFAULT 'neutral',
    comments TEXT
)";

const SEED: &[(&str, Option<i64>, &str, f64, i64, &str, Option<&str>)] = &[
    (
        "The Pragmatic Programmer",
        None,
        "pending",
        8.4,
        12,
        "neutral",
        None,
    ),
    ("Disco Elysium", None, "pending", 9.1, 25, "neutral", None),
    ("Dune: Part Two", None, "pending", 8.0, 3, "neutral", None),
    ("Hades", None, "pending", 8.7, 30, "neutral", None),
    (
        "Project Hail Mary",
        None,
        "pending",
        8.6,
        16,
        "neutral",
        None,
    ),
];

#[tauri::command]
pub fn init_db(db: State<'_, Db>) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute_batch(SCHEMA).map_err(|e| e.to_string())?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM entries", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    if count == 0 {
        for (title, rating, status, score, duration, interest, comments) in SEED {
            conn.execute(
                "INSERT INTO entries (title, rating, status, score, duration, interest, comments) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![*title, *rating, *status, *score, *duration, *interest, *comments],
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
        .prepare(
            "SELECT id, title, rating, status, score, duration, interest, comments FROM entries",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |r| {
            Ok(Entry {
                id: r.get(0)?,
                title: r.get(1)?,
                rating: r.get(2)?,
                status: r.get(3)?,
                score: r.get(4)?,
                duration: r.get(5)?,
                interest: r.get(6)?,
                comments: r.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_entry(db: State<'_, Db>, input: EntryInput) -> Result<Entry, String> {
    input.verify()?;
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let EntryInput {
        title,
        rating,
        status,
        score,
        duration,
        interest,
        comments,
    } = input;
    conn.execute(
        "INSERT INTO entries (title, rating, status, score, duration, interest, comments) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![title, rating, status, score, duration, interest, comments],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(Entry {
        id,
        title,
        rating,
        status,
        score,
        duration,
        interest,
        comments,
    })
}

#[tauri::command]
pub fn update_entry(db: State<'_, Db>, id: i64, input: EntryInput) -> Result<Entry, String> {
    input.verify()?;
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let EntryInput {
        title,
        rating,
        status,
        score,
        duration,
        interest,
        comments,
    } = input;
    let rows = conn
        .execute(
            "UPDATE entries SET title = ?2, rating = ?3, status = ?4, score = ?5, duration = ?6, interest = ?7, comments = ?8 WHERE id = ?1",
            params![id, title, rating, status, score, duration, interest, comments],
        )
        .map_err(|e| e.to_string())?;
    if rows == 0 {
        return Err("entry not found".to_string());
    }
    Ok(Entry {
        id,
        title,
        rating,
        status,
        score,
        duration,
        interest,
        comments,
    })
}

#[tauri::command]
pub fn delete_entry(db: State<'_, Db>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM entries WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn import_entries(db: State<'_, Db>, json: String) -> Result<Vec<Entry>, String> {
    let payload: EntryEnvelope =
        serde_json::from_str(&json).map_err(|e| format!("invalid JSON: {e}"))?;
    let mut conn = db.0.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM entries", [])
        .map_err(|e| e.to_string())?;
    let mut inserted = Vec::with_capacity(payload.entries.len());
    for input in payload.entries {
        input.verify()?;
        let EntryInput {
            title,
            rating,
            status,
            score,
            duration,
            interest,
            comments,
        } = input;
        tx.execute(
            "INSERT INTO entries (title, rating, status, score, duration, interest, comments) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![title, rating, status, score, duration, interest, comments],
        )
        .map_err(|e| e.to_string())?;
        inserted.push(Entry {
            id: tx.last_insert_rowid(),
            title,
            rating,
            status,
            score,
            duration,
            interest,
            comments,
        });
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(inserted)
}

#[tauri::command]
pub fn export_entries(db: State<'_, Db>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT title, rating, status, score, duration, interest, comments FROM entries")
        .map_err(|e| e.to_string())?;
    let exported: Vec<EntryInput> = stmt
        .query_map([], |r| {
            Ok(EntryInput {
                title: r.get(0)?,
                rating: r.get(1)?,
                status: r.get(2)?,
                score: r.get(3)?,
                duration: r.get(4)?,
                interest: r.get(5)?,
                comments: r.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    serde_json::to_string_pretty(&EntryEnvelope { entries: exported }).map_err(|e| e.to_string())
}

pub fn open(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&dir)?;
    let conn = Connection::open(dir.join("backlog.db"))?;
    app.manage(Db(Mutex::new(conn)));
    Ok(())
}
