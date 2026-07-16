# Backlog

Tauri 2 desktop app. Tracks backlogs (books, movies, games) with a score derived from rating + time-to-consume.

## Stack
- Frontend: SvelteKit 2 (Svelte 5 runes) + TS strict, shadcn-svelte (vega / lucide / neutral) on Tailwind v4 + `tw-animate-css`.
- Backend: Tauri 2 (Rust), `tauri-plugin-sql` (sqlite) + `tauri-plugin-opener`.
- Package manager: bun. Task runner: just. Formatter/linter: Biome. Rust: default rustfmt.

## Layout
- `src/` — SvelteKit app. Entry: `src/routes/+page.svelte`, layout at `src/routes/+layout.ts`. All shared code under `src/lib/`; shadcn primitives in `src/lib/components/ui/`.
- `src-tauri/` — Rust crate. Entry: `src-tauri/src/lib.rs` (commands) and `src-tauri/src/main.rs`. Crate name `backlog_lib`. Capability file: `src-tauri/capabilities/default.json`.
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
- Tauri Rust commands are registered in `src-tauri/src/lib.rs` via `tauri::generate_handler![...]` and called from the frontend with `invoke()`.
- New SQL-using code needs no extra capability entry; `sql:default` is already granted. New Tauri plugins require both `Cargo.toml` + `tauri-plugin-*` init in `lib.rs` and a matching `permissions` entry in `src-tauri/capabilities/default.json`.

## Gotchas
- `src-tauri/lib` crate name ends in `_lib` on purpose (Windows bin/lib name collision). Don't rename to `backlog`.
- `vite.config.js` ignores `src-tauri/**` from the watcher. Rust changes need a manual rebuild / `tauri dev` reload.
- `.svelte-kit/`, `build/`, `src-tauri/target/`, and `src-tauri/gen/schemas` are generated — never edit by hand.
- `tauri.conf.json` `frontendDist` is `../build` (relative to `src-tauri/`); `bun run build` must run before `tauri build`.
- `opencode.json` enables the Svelte plugin (MCP) and formatter. No repo-local agent rules file exists beyond this.

## Git workflow
No convention enforced. Commit to `main` is fine.
