import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { renderSnippet, renderComponent } from "$lib/components/ui/data-table/index.js";
import type { Entry } from "$lib/types/domain";
import StatusCell from "./status-cell.svelte";

export const columns: ColumnDef<Entry>[] = [
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "status",
        header: () => {
            return renderSnippet(
                createRawSnippet(() => ({
                    render: () => `<div class="text-center w-full font-semibold">Status</div>`,
                }))
            );
        },
        cell: ({ row }) => {
            return renderComponent(StatusCell, {
                value: row.getValue("status"),
                class: "flex justify-center"
            });
        },
    },
    {
        accessorKey: "score",
        header: () => {
            return renderSnippet(
                createRawSnippet(() => ({
                    render: () => `<div class="text-center w-full font-semibold">Score</div>`,
                }))
            );
        },
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
        header: () => {
            return renderSnippet(
                createRawSnippet(() => ({
                    render: () => `<div class="text-center w-full font-semibold">Duration</div>`,
                }))
            );
        },
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
        accessorKey: "priority",
        header: () => {
            return renderSnippet(
                createRawSnippet(() => ({
                    render: () => `<div class="text-center w-full font-semibold">Priority</div>`,
                }))
            );
        },
        cell: ({ row }) => {
			const priorityCellSnippet = createRawSnippet<[{ priority: number }]>(
				(getPriority) => {
					const { priority } = getPriority();
					return {
						render: () =>
							`<div class="text-right tabular-nums">${priority}</div>`,
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
