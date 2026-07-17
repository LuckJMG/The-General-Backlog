# Backlog

Tauri 2 desktop app. Tracks backlog entries with a priority score derived from rating and time-to-consume.

## MVP
- Single table `entries` with columns: `id` (autoinc), `title` (text), `score` (real), `duration` (integer, hours).
- CRUD via five Tauri commands: `init_db`, `list_entries`, `add_entry`, `update_entry`, `delete_entry`.
- Priority formula: `score / duration`, sorted descending; the `Priority` column displays min-max normalized to 0-100 for visual ranking.
- On first launch, `init_db` seeds 5 sample rows if the table is empty.
- Hover-revealed edit/delete buttons per row; both flows share one `EntryDialog` form (title, score, duration) with non-empty title + positive score/duration validation.
- DB file lives at `<app_data_dir>/backlog.db` per platform (managed by `tauri::Manager` in `src-tauri/src/db.rs:122`).

## Stack
- Frontend: SvelteKit 2 (Svelte 5 runes) + TS strict, shadcn-svelte (vega / lucide / neutral) on Tailwind v4 + `tw-animate-css`. Data table: `@tanstack/table-core` via the local shadcn wrapper at `src/lib/components/ui/data-table/`.
- Backend: Tauri 2 (Rust) with `rusqlite` (bundled, no `tauri-plugin-sql`). `tauri-plugin-opener` is registered but unused in the MVP.
- Package manager: bun. Task runner: just. Formatter/linter: Biome. Rust: default rustfmt.

## Layout
- `src/` — SvelteKit app. Entry: `src/routes/+page.svelte`, layout at `src/routes/+layout.ts`. All shared code under `src/lib/`; shadcn primitives in `src/lib/components/ui/`.
- `src/lib/db.ts` — `DbEntry` type + 5 thin `invoke()` wrappers, one per Tauri command.
- `src/lib/priority.ts` — pure `prioritize(entries) → { rows, min, max }` (no I/O).
- `src/lib/components/entry-dialog.svelte` — shared add/edit form; consumed by the two dialog wrappers below.
- `src/lib/components/add-entry-dialog.svelte`, `edit-entry-dialog.svelte` — thin wrappers around `EntryDialog` (trigger button + submit/cancel wiring).
- `src/routes/+page.svelte` — loads entries on mount, owns the `entries` state, derives `result` and `columns` reactively.
- `src/routes/data-table.svelte` — TanStack table with hover-revealed action buttons; calls back into the page on delete/edit.
- `src/routes/columns.ts` — column defs; `Priority` cell is a 0-100 normalized render of the raw ratio.
- `src-tauri/` — Rust crate. Entry: `src-tauri/src/lib.rs` (commands) and `src-tauri/src/main.rs`. Crate name `backlog_lib`. DB code in `src-tauri/src/db.rs`. Capability file: `src-tauri/capabilities/default.json`.
- Aliases: `$lib` (SvelteKit default), `@/*` -> `src/lib/*` (svelte.config.js). shadcn aliases per `components.json`.
- App identifier: `com.luck.backlog` (tauri.conf.json). Window: 800x600, single window named `main`.

## Commands
Run from repo root unless noted.
- `just dev` — start Tauri dev (runs `bun tauri dev`, which spawns Vite on 1420 then the Rust app).
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
- `tauri-plugin-opener` is loaded in `lib.rs` and `opener:default` is granted in `capabilities/default.json`, but no UI calls it yet. Remove if it stays unused.
- The seed block in `init_db` only runs when `SELECT COUNT(*) FROM entries` is 0 — wiping the DB file is the only way to re-seed.

## Git workflow
No convention enforced. Commit to `main` is fine.
