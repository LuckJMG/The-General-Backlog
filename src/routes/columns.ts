import type { ColumnDef, RowData } from "@tanstack/table-core";
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
	},
];
