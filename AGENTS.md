# Backlog

Tauri 2 desktop app. Tracks backlog entries with a priority score derived from score, duration, and interest.

## Schema
Single table `entries`: `id` (autoinc), `title` (text), `rating` (int 1-7, nullable), `status` (text, `pending`/`active`/`dropped`/`finished`/`completed`, default `pending`), `score` (real), `duration` (int hours), `interest` (text, `neutral`/`high`/`low`, default `neutral`), `comments` (text, nullable). Column order mirrored in `Entry` struct, `EntryInput`, dialog form, and table.

## Tauri commands
Seven: `init_db`, `list_entries`, `add_entry`, `update_entry`, `delete_entry`, `import_entries`, `export_entries`. JSON envelope for import/export: `{ entries: EntryInput[] }`. Import runs in a tx, deletes all rows, re-inserts; export returns pretty JSON string. `init_db` is plain `CREATE TABLE IF NOT EXISTS` — no migrations; schema changes require DB reset (`just clean`).

Validation in `EntryInput::verify`: non-empty title, rating ∈ 1..=7 (if Some), status ∈ STATUSES, interest ∈ INTERESTS, score > 0, duration > 0.

## Priority
`score / duration * interest_multiplier` (neutral 1.0, high 1.2, low 0.8). `prioritize()` in `src/lib/priority.ts` returns entries with `priority` min-max normalized to 0-100 over active rows; inactive statuses (`finished`/`dropped`/`completed`) get `priority: undefined`. If all active scores equal (span 0), normalizes to 100.

## Sort ranks
`STATUS_RANK`: pending=0, active=1, dropped=2, finished=3, completed=4. `INTEREST_RANK`: high=0, neutral=1, low=2. Columns sort by `RANK[a] - RANK[b]` so ASC = low-rank-first. Default table sort: `[{ id: "priority", desc: true }]`.

## UI

### Badges
- `StatusBadge` — pending=yellow, active=blue, dropped=red, finished=green, completed=purple.
- `InterestBadge` — neutral=gray, high=blue, low=orange.
- `RatingBadge` — 1=red-700, 2=red-500, 3=red-400, 4=gray-500, 5=green-400, 6=green-500, 7=green-700. Label map inline as `LABELS` (Blasphemy, Horrible, Bad, Neutral, Good, Excellent, Masterpiece). Null renders plain `-`.

### Columns
Title, Rating, Status, Score, Duration, Interest, Priority. Rating + Priority use `sortUndefined: "last"`. Priority cell renders `-` when undefined.

### Dialogs
- `EntryDialog` — shared add/edit form. Props: `mode: "add" | "edit"`, `bind:open`, `entry?`, `onSubmitted(entry)`, `onClose()`. Fields: title, status, interest, score, duration, rating, comments. Rating + comments shown in edit mode and when add-mode Bulk switch is on. Bulk keeps the form open after submit (clears title/rating/comments) for rapid entry.
- `BadgeSelect<T>` — generic Select backed by badge snippets; used for status/interest/rating.
- `DeleteEntryDialog` — AlertDialog confirm; called from `data-table` delete button.
- `ConfirmImportDialog` — AlertDialog confirm; called from settings import flow.
- `SettingsDialog` — Export JSON (save dialog → `writeTextFile`) and Import JSON (file dialog → `readTextFile` → `importEntries`, replaces all rows on confirm).

### Page
`+page.svelte` loads entries on mount, owns `entries`, derives `rows` via `prioritize` then filters by title (case-insensitive `includes`) and status (or "all"). Toolbar: search input, status filter Select, clear-filters button (visible when any filter active), Add entry, Settings. Add/edit reuse one `EntryDialog`; edit handler copies entry into `editing`, opens the same dialog. `DataTable` shows hover-revealed edit/delete buttons on each row; delete goes through `DeleteEntryDialog`.

## Stack
SvelteKit 2 (Svelte 5 runes) + TS strict, shadcn-svelte (vega / lucide / neutral) on Tailwind v4 + `tw-animate-css`. Data table: `@tanstack/table-core` via `src/lib/components/ui/data-table/`. Tauri 2 with `rusqlite` (bundled), `tauri-plugin-dialog`, `tauri-plugin-fs`, `serde`, `serde_json`. No `tauri-plugin-sql`. bun + just + Biome + rustfmt.

## Layout
- `src/lib/db.ts` — types + 7 `invoke()` wrappers + `STATUS_RANK`/`INTEREST_RANK`/`INTEREST_MULTIPLIER`/`ENTRY_STATUSES`/`ENTRY_INTERESTS`/`RATING_VALUES` constants.
- `src/lib/priority.ts` — pure `prioritize()`.
- `src/lib/columns.ts` — static `columns` array.
- `src/lib/components/` — `entry-dialog`, `data-table`, `badge-select`, `status-badge`, `interest-badge`, `rating-badge`, `delete-entry-dialog`, `confirm-import-dialog`, `settings-dialog`.
- `src/routes/+page.svelte` — page state + chrome.
- `src/routes/+layout.ts` — `export const ssr = false`.
- `src-tauri/src/lib.rs` — registers commands, plugins, `setup` calls `db::open`.
- `src-tauri/src/db.rs` — all SQL.
- `src-tauri/capabilities/default.json` — `core:default` + dialog/fs permissions, fs scope `**`.

Aliases: `$lib` (default), `@/*` -> `src/lib/*` (svelte.config.js). shadcn per `components.json`. App id `com.luck.backlog`, window 800x600, single window named `main`.

## Commands
Run from repo root unless noted.
- `just dev` — exports `WEBKIT_DISABLE_DMABUF_RENDERER=1 LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe` then `bun tauri dev` (Linux GPU workarounds). Vite on 1420 (fixed, `strictPort: true`).
- `just clean` — `rm -rf ~/.local/share/com.luck.backlog/backlog.db` (Linux path; manual delete on other OS).
- `just lint` — `bunx --bun @biomejs/biome check --write`.
- `bun run check` — `svelte-kit sync` + `svelte-check`.
- `cargo fmt` / `cargo check` (in `src-tauri/`) — on demand.

## Conventions
- Tabs, double quotes (Biome enforces).
- `.svelte` overrides: `useConst`/`useImportType`/`noUnusedVariables`/`noUnusedImports` off; other files use `recommended`.
- SPA-only (`ssr=false`, `adapter-static` with `index.html` fallback). No SSR.
- Vite port 1420 is fixed; change both `vite.config.js` and `tauri.conf.json` `devUrl` together.
- New SQL op → new command in `db.rs` + wrapper in `db.ts`. No `tauri-plugin-sql`.
- Prefer Tailwind classes over raw CSS; prefer predefined scale values over forced units.
- Bug fix = root cause, not symptom. One guard in the shared function beats N guards at callers.

## Gotchas
- Crate name `backlog_lib` (Windows bin/lib collision). Don't rename.
- `vite.config.js` ignores `src-tauri/**`; Rust changes need manual rebuild.
- Generated, never edit: `.svelte-kit/`, `build/`, `src-tauri/target/`, `src-tauri/gen/schemas`.
- `tauri.conf.json` `frontendDist` is `../build`; run `bun run build` before `tauri build`.
- Seed block in `init_db` runs only when `COUNT(*) = 0`. Wipe the DB file to re-seed.
- `opencode.json` enables the Svelte MCP plugin + formatter.
