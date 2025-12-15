<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";

	let { value, class: className } = $props<{ value: string, class?: string }>();

	const colors: Record<string, string> = {
		finished: "bg-blue-300 border-transparent text-white",
		started: "bg-green-300 border-transparent text-white",
		dropped: "bg-red-300 border-transparent text-white",
		pending: "bg-yellow-300 border-transparent text-white"
	};

	let label = $derived(value.charAt(0).toUpperCase() + value.slice(1));
	let colorClass = $derived(colors[value] || "bg-gray-500 text-white");
</script>

<div class={className}>
    <Badge class={colorClass}>
        {label}
    </Badge>
</div>
