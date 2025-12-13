<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";

	let { value, class: className } = $props<{ value: string, class?: string }>();

	const colors: Record<string, string> = {
		high: "bg-blue-300 border-transparent text-white",
		neutral: "bg-gray-300 border-transparent text-white",
		low: "bg-orange-300 border-transparent text-white",
	};

	let label = $derived(value.charAt(0).toUpperCase() + value.slice(1));
	let colorClass = $derived(colors[value] || "bg-gray-500 text-white");
</script>

<div class={className}>
    <Badge class={colorClass}>
        {label}
    </Badge>
</div>
