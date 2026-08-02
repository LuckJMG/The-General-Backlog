dev:
	__NV_DISABLE_EXPLICIT_SYNC=1 bun tauri dev

clean:
	rm -rf ~/.local/share/com.luck.backlog/backlog.db

lint:
	bunx --bun @biomejs/biome check --write
