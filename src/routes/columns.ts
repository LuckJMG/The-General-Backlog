import type { ColumnDef } from "@tanstack/table-core";
import type { Entry } from "$lib/priority";

export function makeColumns(min: number, max: number): ColumnDef<Entry>[] {
	const span = max - min;
	return [
		{ accessorKey: "name", header: "Name" },
		{ accessorKey: "score", header: "Score" },
		{ accessorKey: "duration", header: "Duration" },
		{
			accessorKey: "priority",
			header: "Priority",
			cell: (info) => {
				const v =
					span === 0 ? 100 : (((info.getValue() as number) - min) / span) * 100;
				return Math.round(v);
			},
		},
	];
}
