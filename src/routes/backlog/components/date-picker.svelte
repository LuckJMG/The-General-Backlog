<script lang="ts">
import CalendarIcon from "@lucide/svelte/icons/calendar";
import {
	DateFormatter,
	type DateValue,
	getLocalTimeZone,
	fromDate
} from "@internationalized/date";
import { cn } from "$lib/utils";
import { Button } from "$lib/components/ui/button";
import { Calendar } from "$lib/components/ui/calendar";
import * as Popover from "$lib/components/ui/popover";

let { value = $bindable(), id } = $props<{ value: Date | null | undefined, id?: string }>();

const df = new DateFormatter("en-UK", {
	dateStyle: "short",
});

let calendarValue = $state<DateValue | undefined>(
	value ? fromDate(value, getLocalTimeZone()) : undefined
);

$effect(() => {
	if (value) {
		calendarValue = fromDate(value, getLocalTimeZone());
	} else {
		calendarValue = undefined;
	}
});

function handleDateChange(v: DateValue | undefined) {
	calendarValue = v;
	if (v) {
		value = v.toDate(getLocalTimeZone());
	} else {
		value = null;
	}
}
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn(
					"w-full justify-start text-left font-normal",
					!value && "text-muted-foreground"
				)}
				{...props}
				{id}
			>
				<CalendarIcon class="mr-2 h-4 w-4" />
				{value ? df.format(value) : "Pick a date"}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar 
			type="single"
			value={calendarValue} 
			onValueChange={handleDateChange} 
			initialFocus 
		/>
	</Popover.Content>
</Popover.Root>
