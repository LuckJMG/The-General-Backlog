import type { ColumnDef, RowData } from "@tanstack/table-core";
import type { Component } from "svelte";
import StatusBadge from "$lib/components/status-badge.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import type { EntryStatus } from "$lib/db";
import type { Entry } from "$lib/priority";

declare module "@tanstack/table-core" {
	interface ColumnMeta<TData extends RowData, TValue> {
		headAlign?: "left" | "center" | "right";
		align?: "left" | "center" | "right";
	}
}

const STATUS_RANK: Record<EntryStatus, number> = {
	pending: 0,
	active: 1,
	dropped: 2,
	finished: 3,
	completed: 4,
};

export const columns: ColumnDef<Entry>[] = [
	{ accessorKey: "title", header: "Title" },
	{
		accessorKey: "status",
		header: "Status",
		sortingFn: (a, b) =>
			STATUS_RANK[a.original.status] - STATUS_RANK[b.original.status],
		cell: (c) =>
			renderComponent(StatusBadge as Component<Record<string, unknown>>, {
				status: c.row.original.status,
			}),
	},
	{
		accessorKey: "score",
		header: "Score",
		meta: { headAlign: "center", align: "right" },
	},
	{
		accessorKey: "duration",
		header: "Duration",
		meta: { headAlign: "center", align: "right" },
	},
	{
		accessorKey: "priority",
		header: "Priority",
		meta: { headAlign: "center", align: "right" },
		sortUndefined: "last",
		sortingFn: "basic",
		cell: (c) => c.getValue() ?? "-",
	},
];
