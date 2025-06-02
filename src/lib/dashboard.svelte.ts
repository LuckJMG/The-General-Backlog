import { parse, serialize } from "cookie";
import { Entry } from "./entry";
import type { SortingState } from "@tanstack/table-core";

export const entries: Entry[] = $state(getEntriesFromCookies());

export enum Column {
	TITLE = 'Title',
	SCORE = 'Score',
	DURATION = 'Duration',
	PRIORITY = 'Priority',
}

export const columnKeyMap: Record<Column, keyof Entry> = {
	[Column.TITLE]: "title",
	[Column.SCORE]: "score",
	[Column.DURATION]: "duration",
	[Column.PRIORITY]: "priority",
};

export function updateCookies() {
	try {
		document.cookie = serialize("entries", JSON.stringify(entries), {
			path: "/",
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
	} catch (err) {
		console.error("Failed to save entries to cookies:", err);
	}
}

function getEntriesFromCookies() {
	let entries: Entry[] = [];

	try {
		let cookies = parse(document.cookie);
		if (cookies.entries) entries = JSON.parse(cookies.entries);
	}
	catch (err) {
		console.warn("Could not parse entries from cookies:", err);
	}

	return entries
}

export function getSortingFromCookies(): SortingState {
	try {
		const match = document.cookie.match(/(?:^|;\s*)sorting=([^;]*)/);
		if (match && match[1]) return JSON.parse(decodeURIComponent(match[1]));
	} catch (e) {
		console.warn("Failed to parse sorting from cookies", e);
	}

	return [];
}
