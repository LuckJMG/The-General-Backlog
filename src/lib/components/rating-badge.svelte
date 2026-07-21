<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";
import { type EntryRating, RATING_LABELS } from "$lib/db";

let { rating }: { rating: EntryRating | null | undefined } = $props();

const COLORS: Record<EntryRating, string> = {
	1: "bg-red-700/15 text-red-700 border-red-700/30 dark:text-red-400",
	2: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400",
	3: "bg-red-400/15 text-red-700 border-red-400/30 dark:text-red-400",
	4: "bg-gray-500/15 text-gray-700 border-gray-500/30 dark:text-gray-400",
	5: "bg-green-400/15 text-green-700 border-green-400/30 dark:text-green-400",
	6: "bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400",
	7: "bg-green-700/15 text-green-700 border-green-700/30 dark:text-green-400",
};
</script>

{#if rating == null}
	<span class="text-muted-foreground">-</span>
{:else}
	<Badge variant="outline" class={COLORS[rating]}>{RATING_LABELS[rating]}</Badge>
{/if}
