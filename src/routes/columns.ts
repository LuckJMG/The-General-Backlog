import type { ColumnDef } from "@tanstack/table-core";
import type { Entry } from "$lib/priority";

export const columns: ColumnDef<Entry>[] = [
	{ accessorKey: "title", header: "Title" },
	{ accessorKey: "score", header: "Score" },
	{ accessorKey: "duration", header: "Duration" },
	{ accessorKey: "priority", header: "Priority" },
];
