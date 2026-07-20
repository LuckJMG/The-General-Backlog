<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";
import type { EntryStatus } from "$lib/db";

let { status }: { status: EntryStatus } = $props();

const COLORS: Record<EntryStatus, string> = {
	pending:
		"bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400",
	active: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400",
	dropped: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400",
	finished:
		"bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400",
	completed:
		"bg-purple-500/15 text-purple-700 border-purple-500/30 dark:text-purple-400",
};
</script>

<Badge variant="outline" class="capitalize {COLORS[status]}">{status}</Badge>
