import type { ColumnDef, RowData } from "@tanstack/table-core";
import type { Component } from "svelte";
import InterestBadge from "$lib/components/interest-badge.svelte";
import RatingBadge from "$lib/components/rating-badge.svelte";
import StatusBadge from "$lib/components/status-badge.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import { INTEREST_RANK, STATUS_RANK } from "$lib/db";
import type { Entry } from "$lib/priority";

declare module "@tanstack/table-core" {
	interface ColumnMeta<TData extends RowData, TValue> {
		headAlign?: "left" | "center" | "right";
		align?: "left" | "center" | "right";
	}
}

export const columns: ColumnDef<Entry>[] = [
	{ accessorKey: "title", header: "Title" },
	{
		accessorKey: "rating",
		header: "Rating",
		meta: { headAlign: "center", align: "center" },
		accessorFn: (row) => row.rating ?? undefined,
		sortUndefined: "last",
		sortingFn: "basic",
		cell: (c) =>
			renderComponent(RatingBadge as Component<Record<string, unknown>>, {
				rating: c.getValue(),
			}),
	},
	{
		accessorKey: "status",
		header: "Status",
		meta: { headAlign: "center", align: "center" },
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
		accessorKey: "interest",
		header: "Interest",
		meta: { headAlign: "center", align: "center" },
		sortingFn: (a, b) =>
			INTEREST_RANK[a.original.interest] - INTEREST_RANK[b.original.interest],
		cell: (c) =>
			renderComponent(InterestBadge as Component<Record<string, unknown>>, {
				interest: c.row.original.interest,
			}),
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
