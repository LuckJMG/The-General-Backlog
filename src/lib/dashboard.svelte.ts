import { parse, serialize } from "cookie";
import { Entry } from "./entry";
import type { SortingState } from "@tanstack/table-core";

export enum Column {
	TITLE = 'Title',
	SCORE = 'Score',
	DURATION = 'Duration',
	PRIORITY = 'Priority',
};

export const columnKeyMap: Record<Column, keyof Entry> = {
	[Column.TITLE]: "title",
	[Column.SCORE]: "score",
	[Column.DURATION]: "duration",
	[Column.PRIORITY]: "priority",
};

const defaultSorting: SortingState = [{
	desc: true,
	id: "priority",
}];

export function updateCookies() {
	const cookieConfig = (label: string, data: any) => serialize(
		label,
		JSON.stringify(data),
		{
			path: "/",
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 30,
		}
	);

	try {
		document.cookie = cookieConfig("entries", entries);
		document.cookie = cookieConfig("sorting", sorting);
	} catch (err) {
		console.error("Failed to save entries to cookies:", err);
	}
}

export function getCookies(): { entries: Entry[], sorting: SortingState } {
	try {
		let cookies = parse(document.cookie);
		let entries = cookies.entries ? JSON.parse(cookies.entries) : [];
		let sorting = cookies.sorting ? JSON.parse(cookies.sorting) : defaultSorting;
		return { entries, sorting };
	}
	catch (err) {
		console.warn("Could not parse entries from cookies:", err);
		return { entries: [], sorting: defaultSorting };
	}
}

const cookies = getCookies();
export const entries: Entry[] = $state(cookies.entries);
export const sorting: SortingState = $state(cookies.sorting);
