import { type Column, type ColumnDef, type Row } from "@tanstack/table-core";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index.js";
import DashboardHeader from "./DashboardHeader.svelte";
import { Entry } from "$lib/entry";
import { dashboardStore } from "$lib/dashboard.svelte";
import { createRawSnippet } from "svelte";

export const columns: ColumnDef<Entry>[] = [
	{
		accessorKey: "title",
		header: ({ column }) => renderHeader(column, "Title"),
		cell: ({ row }) => renderCell(row, "title", "pl-4 font-medium text-[#374151]"),
	},
	{
		accessorKey: "score",
		header: ({ column }) => renderHeader(column, "Score"),
		cell: ({ row }) => renderCell(row, "score", "pl-4"),
	},
	{
		accessorKey: "duration",
		header: ({ column }) => renderHeader(column, "Duration"),
		cell: ({ row }) => renderCell(row, "duration", "pl-4"),
	},
	{
		accessorKey: "priority",
		header: ({ column }) => renderHeader(column, "Priority"),
		cell: ({ row }) => {
			let priorityCellSnippet = createRawSnippet<[string]>((getPriority) => {
				const priority = getPriority();
				return {
					render: () => `<div class="pl-4">${priority}</div>`,
				};
			});

			let priority: number = row.getValue("priority");
			let { min, max } = dashboardStore.range;

			if (min === max) return renderSnippet(priorityCellSnippet, "50");

			let normalized = Math.round(((priority - min) / (max - min)) * 100);
			return renderSnippet(priorityCellSnippet, normalized.toString());
		}
	},
];

function renderHeader(column: Column<Entry, unknown>, label: string) {
	return renderComponent(DashboardHeader, {
				label: label,
				onclick: column.getToggleSortingHandler(),
				isSorted: column.getIsSorted(),
			})
}

function renderCell(row: Row<Entry>, column: string, classes: string) {
	let cellSnippet = createRawSnippet<[string]>((getValue) => {
		let value = getValue();
		return {
			render: () => `<div class="${classes}">${value}</div>`
		};
	});
	return renderSnippet(cellSnippet, row.getValue(column));
}
