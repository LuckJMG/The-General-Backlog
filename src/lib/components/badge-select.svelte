<script lang="ts" generics="T extends string">
import type { Snippet } from "svelte";
import { Label } from "$lib/components/ui/label/index.js";
import * as Select from "$lib/components/ui/select/index.js";

type Props = {
	id: string;
	label: string;
	value: T;
	options: readonly T[];
	render: Snippet<[T]>;
};

let { id, label, value = $bindable(), options, render }: Props = $props();
</script>

<div class="flex flex-col gap-2">
	<Label for={id}>{label}</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger id={id} class="w-full">
			{@render render(value)}
		</Select.Trigger>
		<Select.Content>
			{#each options as opt (opt)}
				<Select.Item value={String(opt)} label={String(opt)}>
					{@render render(opt)}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
