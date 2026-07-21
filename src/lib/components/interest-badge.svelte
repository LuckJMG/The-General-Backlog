<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";
import type { EntryInterest } from "$lib/db";

let { interest }: { interest: EntryInterest } = $props();

const COLORS: Record<EntryInterest, string> = {
	neutral: "bg-gray-500/15 text-gray-700 border-gray-500/30 dark:text-gray-400",
	high: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400",
	low: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400",
};
</script>

<Badge variant="outline" class="capitalize {COLORS[interest]}">{interest}</Badge>
