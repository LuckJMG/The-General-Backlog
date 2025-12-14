<script lang="ts">
	import type { ComponentProps } from "svelte";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
	import { Button } from "$lib/components/ui/button/index.js";

	let {
		title,
		sortDir,
		align = "center",
		variant = "ghost",
		...restProps
	}: {
		title: string;
		sortDir: false | "asc" | "desc";
		align?: "left" | "center" | "right";
	} & ComponentProps<typeof Button> = $props();

	const alignClasses = {
		left: "justify-start text-left px-0",
		center: "justify-center text-center",
		right: "justify-end text-right px-0"
	};
</script>

<Button
	{variant}
	{...restProps}
	class="w-full font-semibold {alignClasses[align]}"
>
	{title}

	{#if sortDir === "asc"}
		<ArrowUp class="ms-2 h-4 w-4" />
	{:else if sortDir === "desc"}
		<ArrowDown class="ms-2 h-4 w-4" />
	{:else}
		<ArrowUpDown class="ms-2 h-4 w-4 opacity-50" />
	{/if}
</Button>
