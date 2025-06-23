import type { Column, ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DashboardHeader from "./DashboardHeader.svelte";
import DashboardActions from "./DashboardActions.svelte";
import type { Entry } from "$lib/entry";

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
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return renderComponent(DashboardActions, { id: row.original.id });
		},
	},
];

function renderHeader(column: Column<Entry, unknown>, label: String) {
	return renderComponent(DashboardHeader, {
				label: label,
				onclick: column.getToggleSortingHandler(),
				isSorted: column.getIsSorted(),
			})
}
