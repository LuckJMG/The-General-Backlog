<script lang="ts">
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import { Button } from "$lib/components/ui/button/index.js";

	let { label, isSorted, ...restProps } = $props();
</script>

<Button variant="ghost" {...restProps}>
	{label}

	{#if isSorted === "asc"}
		<ArrowUpIcon class="ml-2 h-4 w-4" />
	{:else if isSorted === "desc"}
		<ArrowDownIcon class="ml-2 h-4 w-4" />
	{:else}
		<ArrowUpDownIcon class="ml-2 h-4 w-4" />
	{/if}
</Button>
