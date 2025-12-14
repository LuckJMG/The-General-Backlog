import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { renderSnippet, renderComponent } from "$lib/components/ui/data-table/index.js";
import type { Entry } from "$lib/types/domain";
import StatusCell from "./status-cell.svelte";
import InterestCell from "./interest-cell.svelte";
import SortButton from "./sort-button.svelte";

export const columns: ColumnDef<Entry>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => renderComponent(SortButton, {
			title: "Title",
			sortDir: column.getIsSorted(),
            onclick: column.getToggleSortingHandler(),
            align: "left",
		}),
    },
    {
        accessorKey: "status",
        header: ({ column }) => renderComponent(SortButton, {
			title: "Status",
			sortDir: column.getIsSorted(),
            onclick: column.getToggleSortingHandler(),
            align: "center",
		}),
        cell: ({ row }) => {
            return renderComponent(StatusCell, {
                value: row.getValue("status"),
                class: "flex justify-center"
            });
        },
    },
    {
        accessorKey: "score",
        header: ({ column }) => renderComponent(SortButton, {
			title: "Score",
			sortDir: column.getIsSorted(),
            onclick: column.getToggleSortingHandler(),
            align: "center",
		}),
        cell: ({ row }) => {
			const scoreCellSnippet = createRawSnippet<[{ score: number }]>(
				(getDuration) => {
					const { score } = getDuration();
					return {
						render: () =>
							`<div class="text-right tabular-nums">${score > 0 ? score : "-"}</div>`,
					};
				}
			)
            return renderSnippet(scoreCellSnippet, {
					score: row.original.score,
				}
            );
        },
    },
    {
        accessorKey: "duration",
        header: ({ column }) => renderComponent(SortButton, {
			title: "Duration",
			sortDir: column.getIsSorted(),
            onclick: column.getToggleSortingHandler(),
            align: "center",
		}),
        cell: ({ row }) => {
			const durationCellSnippet = createRawSnippet<[{ duration: number }]>(
				(getDuration) => {
					const { duration } = getDuration();
					return {
						render: () =>
							`<div class="text-right tabular-nums">${duration}</div>`,
					};
				}
			)
            return renderSnippet(durationCellSnippet, {
					duration: row.original.duration,
				}
            );
        },
    },
    {
        accessorKey: "interest",
        header: ({ column }) => renderComponent(SortButton, {
			title: "Interest",
			sortDir: column.getIsSorted(),
            onclick: column.getToggleSortingHandler(),
            align: "center",
		}),
        cell: ({ row }) => {
            return renderComponent(InterestCell, {
                value: row.getValue("interest"),
                class: "flex justify-center"
            });
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => renderComponent(SortButton, {
			title: "Priority",
			sortDir: column.getIsSorted(),
            onclick: column.getToggleSortingHandler(),
            align: "center",
		}),
        cell: ({ row }) => {
			const priorityCellSnippet = createRawSnippet<[{ priority: number }]>(
				(getPriority) => {
					const { priority } = getPriority();
					return {
						render: () =>
							`<div class="text-right tabular-nums">${Math.round(priority)}</div>`,
					};
				}
			)
            return renderSnippet(priorityCellSnippet, {
					priority: row.original.priority,
				}
            );
        },
    },
];
