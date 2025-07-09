<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";
    import type { SelectType } from "$lib/entry";

	interface Props {
		list: Record<string, SelectType>,
		value?: SelectType
		placeholder?: SelectType
		name?: string
	;}

	let { list, value = $bindable(), placeholder, name }: Props = $props();
	let selectedValue: string | undefined = $state(value?.label);

	$effect(() => { selectedValue = value?.label; });

	$effect(() => {
		if (!selectedValue) return;
		let selectedItem = Object.values(list).find(item => item.label === selectedValue);

		if (!selectedItem) return;
		value = selectedItem;
	})
</script>

<Select.Root type="single" name={name} bind:value={selectedValue}>
	<Select.Trigger class="w-[180px]">
		<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {value?.badgeClass || placeholder?.badgeClass}">
			{value?.label || placeholder?.label}
		</span>
		</Select.Trigger>
		<Select.Content>
		<Select.Group>
		{#each Object.values(list) as item}
			<Select.Item
			value={item.label}
			label={item.label}
			>
			<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {item.badgeClass}">
				{item.label}
			</span>
			</Select.Item>
		{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
