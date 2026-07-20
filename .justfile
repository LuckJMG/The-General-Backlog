dev:
	WEBKIT_DISABLE_DMABUF_RENDERER=1 LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe bun tauri dev

clean:
	rm -rf ~/.local/share/com.luck.backlog/backlog.db

lint:
	bunx --bun @biomejs/biome check --write
