mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| db::open(app))
        .invoke_handler(tauri::generate_handler![
            db::init_db,
            db::list_entries,
            db::add_entry,
            db::update_entry,
            db::delete_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
