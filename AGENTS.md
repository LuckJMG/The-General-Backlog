# Backlog

Tauri 2 desktop app. Tracks backlog entries with a priority score derived from rating and time-to-consume.

## MVP
- Single table `entries` with columns: `id` (autoinc), `title` (text), `rating` (integer 1-7, nullable, qualitative word in UI), `status` (text, one of `pending`/`active`/`dropped`/`finished`/`completed`, default `pending`), `score` (real), `duration` (integer, hours), `interest` (text, one of `neutral`/`high`/`low`, default `neutral`). Column order is mirrored exactly in the `Entry` struct, the `EntryDialog` form, the Tauri command signatures, and the displayed table.
- CRUD via five Tauri commands: `init_db`, `list_entries`, `add_entry`, `update_entry`, `delete_entry`.
- Priority formula: `score / duration * interest_multiplier` (neutral=1.0, high=1.2, low=0.8), sorted descending; the `Priority` column displays min-max normalized to 0-100 for visual ranking. Entries with status `finished`/`dropped`/`completed` are excluded from the range and render as `-`, pinned to the bottom in both sort directions (`sortUndefined: "last"`).
- `init_db` migrates pre-status DBs via `ALTER TABLE ... ADD COLUMN status` (guarded by `PRAGMA table_info`). No other migrations; new columns require a DB reset.
- Status column sorts by rank `completed > finished > dropped > active > pending` (desc); asc is the exact reverse. Rendered as a colored `StatusBadge` (pending=yellow, active=blue, dropped=red, finished=green, completed=purple).
- Rating scale 1-7 stored as integer, displayed as qualitative words via `RATING_LABELS`: 1=Blasphemy, 2=Horrible, 3=Bad, 4=Neutral, 5=Good, 6=Excellent, 7=Masterpiece. Null renders as plain `-` (no badge) and sorts last in both directions (`sortUndefined: "last"`). Does not affect priority. Shown only in the edit dialog (add dialog omits the field; new entries default to null). Rendered as a `RatingBadge` with a red→gray→green gradient (1=red-700, 2=red-500, 3=red-400, 4=gray-500, 5=green-400, 6=green-500, 7=green-700).
- Interest column sorts by rank `high > neutral > low`. Rendered as a colored `InterestBadge`.
- On first launch, `init_db` seeds 5 sample rows if the table is empty (all with `rating=NULL`).
- Hover-revealed edit/delete buttons per row. Add (from `+page.svelte`) and edit (from `data-table.svelte`) both use the same `EntryDialog` form (title, status, score, duration, interest, optional rating) with non-empty title + positive score/duration validation; the parent owns the `open` state via `bind:open` and toggles the rating field via the `showRating` prop.
- DB file lives at `<app_data_dir>/backlog.db` per platform (managed by `tauri::Manager` in `src-tauri/src/db.rs:122`).

## Stack
- Frontend: SvelteKit 2 (Svelte 5 runes) + TS strict, shadcn-svelte (vega / lucide / neutral) on Tailwind v4 + `tw-animate-css`. Data table: `@tanstack/table-core` via the local shadcn wrapper at `src/lib/components/ui/data-table/`.
- Backend: Tauri 2 (Rust) with `rusqlite` (bundled, no `tauri-plugin-sql`).
- Package manager: bun. Task runner: just. Formatter/linter: Biome. Rust: default rustfmt.

## Layout
- `src/` — SvelteKit app. Entry: `src/routes/+page.svelte`, layout at `src/routes/+layout.ts`. All shared code under `src/lib/`; shadcn primitives in `src/lib/components/ui/`.
- `src/lib/db.ts` — `DbEntry`/`EntryStatus` types + 5 thin `invoke()` wrappers, one per Tauri command.
- `src/lib/priority.ts` — pure `prioritize(entries) → Entry[]` with `priority` min-max normalized to 0-100 (no I/O); inactive statuses (`finished`/`dropped`/`completed`) get `priority: undefined`.
- `src/lib/components/entry-dialog.svelte` — shared add/edit form (title, status, interest, score, duration, optional rating); instantiated directly by `+page.svelte` (add) and `data-table.svelte` (edit), each binding its own `open` state. `showRating` prop gates the rating row (edit only).
- `src/lib/components/status-badge.svelte` — colored `Badge` per status; used by the status column cell.
- `src/lib/components/interest-badge.svelte` — colored `Badge` per interest; used by the interest column cell and dialog select.
- `src/lib/components/rating-badge.svelte` — colored `Badge` per rating (1-7) with the qualitative word; renders plain `-` (no badge) when null. Used by the rating column cell and edit dialog select.
- `src/routes/+page.svelte` — loads entries on mount, owns the `entries` state, derives `rows` via `prioritize` reactively.
- `src/routes/data-table.svelte` — TanStack table with hover-revealed action buttons; calls back into the page on delete/edit.
- `src/routes/columns.ts` — static `columns` array; `Rating` renders `RatingBadge` (sorts undefined last, ascending puts 1 first), `Status` renders `StatusBadge` and sorts by completion rank, `Interest` renders `InterestBadge` and sorts by rank, `Priority` displays the pre-normalized 0-100 value from `prioritize` (`-` when undefined, `sortUndefined: "last"`).
- `src-tauri/` — Rust crate. Entry: `src-tauri/src/lib.rs` (commands) and `src-tauri/src/main.rs`. Crate name `backlog_lib`. DB code in `src-tauri/src/db.rs`. Capability file: `src-tauri/capabilities/default.json`.
- Aliases: `$lib` (SvelteKit default), `@/*` -> `src/lib/*` (svelte.config.js). shadcn aliases per `components.json`.
- App identifier: `com.luck.backlog` (tauri.conf.json). Window: 800x600, single window named `main`.

## Commands
Run from repo root unless noted.
- `just dev` — start Tauri dev (runs `bun tauri dev`, which spawns Vite on 1420 then the Rust app).
- `just clean` — deletes the current DB state for a fresh start.
- `just lint` — biome check with `--write` (formats + lints + organizes imports).
- `bun run check` — `svelte-kit sync` + `svelte-check` (typecheck). Run after schema/code changes.
- `bun tauri dev` / `bun tauri build` — same as `just dev` plus release build. `tauri.conf.json` already wires beforeDev/beforeBuild to `bun run dev` / `bun run build`.
- `cargo fmt` (in `src-tauri/`) — Rust formatting, on demand. No nightly toolchain pinned.
- `cargo build` / `cargo check` (in `src-tauri/`) — Rust compile/typecheck when not running the full Tauri app.

## Verification flow
1. `just lint` — fix anything biome reports.
2. `bun run check` — must pass before considering frontend work done.
No unit/e2e tests or CI exist yet; do not add them unless asked.

## Conventions
- Indent: tabs. JS/TS string quotes: double. Biome handles both.
- Imports are auto-organized by biome; don't fight it.
- In `.svelte` files, biome allows `useConst`/`useImportType`/unused-var warnings off. Other files stay on the `recommended` preset.
- SvelteKit is SPA-only (`ssr=false`, `adapter-static` with `index.html` fallback). Do not add `+page.server.ts` or SSR-only APIs.
- Vite dev port 1420 is fixed (`strictPort: true`); if it's busy, `tauri dev` will fail. Free the port or change both `vite.config.js` and `tauri.conf.json` `devUrl` together.
- Tauri Rust commands are registered in `src-tauri/src/lib.rs` via `tauri::generate_handler![...]` and called from the frontend with `invoke()`. Add a new SQL operation as a new command in `src-tauri/src/db.rs` and a matching wrapper in `src/lib/db.ts`; do not introduce `tauri-plugin-sql`.
- Add/edit dialogs route through the shared `entry-dialog.svelte`. Don't duplicate the form per flow.

## Gotchas
- `src-tauri/lib` crate name ends in `_lib` on purpose (Windows bin/lib name collision). Don't rename to `backlog`.
- `vite.config.js` ignores `src-tauri/**` from the watcher. Rust changes need a manual rebuild / `tauri dev` reload.
- `.svelte-kit/`, `build/`, `src-tauri/target/`, and `src-tauri/gen/schemas` are generated — never edit by hand.
- `tauri.conf.json` `frontendDist` is `../build` (relative to `src-tauri/`); `bun run build` must run before `tauri build`.
- `opencode.json` enables the Svelte plugin (MCP) and formatter. No repo-local agent rules file exists beyond this.
- The seed block in `init_db` only runs when `SELECT COUNT(*) FROM entries` is 0 — wiping the DB file is the only way to re-seed.

## Git workflow
No convention enforced. Commit to `main` is fine.
