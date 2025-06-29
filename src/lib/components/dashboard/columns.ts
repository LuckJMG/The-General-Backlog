import type { Column, ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DashboardHeader from "./DashboardHeader.svelte";
import DashboardActions from "./DashboardActions.svelte";
import { Entry } from "$lib/entry";
import { dashboardStore } from "$lib/dashboard.svelte";

export const columns: ColumnDef<Entry>[] = [
	{
		accessorKey: "title",
		header: ({ column }) => renderHeader(column, "Title"),
	},
	{
		accessorKey: "score",
		header: ({ column }) => renderHeader(column, "Score"),
	},
	{
		accessorKey: "duration",
		header: ({ column }) => renderHeader(column, "Duration"),
	},
	{
		accessorKey: "priority",
		header: ({ column }) => renderHeader(column, "Priority"),
		cell: ({ getValue }) => {
			let priority = getValue() as number;
			let { min, max } = dashboardStore.range;

			if (min === max) return "50";

			let normalized = Math.round(((priority - min) / (max - min)) * 100);
			return normalized.toString();
		}
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return renderComponent(DashboardActions, { id: Entry.getID(row.original.title) });
		},
	},
];

function renderHeader(column: Column<Entry, unknown>, label: string) {
	return renderComponent(DashboardHeader, {
				label: label,
				onclick: column.getToggleSortingHandler(),
				isSorted: column.getIsSorted(),
			})
}
