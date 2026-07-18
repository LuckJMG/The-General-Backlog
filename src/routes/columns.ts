import type { ColumnDef, RowData } from "@tanstack/table-core";
import type { Entry } from "$lib/priority";

declare module "@tanstack/table-core" {
	interface ColumnMeta<TData extends RowData, TValue> {
		headAlign?: "left" | "center" | "right";
		align?: "left" | "center" | "right";
	}
}

export function makeColumns(min: number, max: number): ColumnDef<Entry>[] {
	const span = max - min;
	return [
		{
			accessorKey: "title",
			header: "Title",
			meta: { headAlign: "left", align: "left" },
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
			cell: (info) => {
				const v =
					span === 0 ? 100 : (((info.getValue() as number) - min) / span) * 100;
				return Math.round(v);
			},
		},
	];
}
