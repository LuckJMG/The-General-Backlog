import { parse, serialize } from "cookie";
import { Entry } from "./entry";
import type { SortingState } from "@tanstack/table-core";

class DashboardStore {
	entries = $state<Record<string, Entry>>({});
	sorting = $state<SortingState>([{ desc: true, id: "priority" }]);
	range = $state({ min: NaN, max: NaN });

	constructor() {
		if (typeof document !== "undefined") this.loadFromCookies();
	}

	private loadFromCookies() {
		try {
			let cookies = parse(document.cookie);
			this.entries = cookies.entries ? JSON.parse(cookies.entries) : this.entries;
			this.sorting = cookies.sorting ? JSON.parse(cookies.sorting) : this.sorting;
			this.range = cookies.range ? JSON.parse(cookies.range) : this.range;
		}
		catch (err) {
			console.warn("Could not parse entries from cookies:", err);
		}
	}

	updateCookies() {
		if (typeof document === "undefined") return;

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
			document.cookie = cookieConfig("entries", this.entries);
			document.cookie = cookieConfig("sorting", this.sorting);
			document.cookie = cookieConfig("range", this.range);
		} catch (err) {
			console.error("Failed to save entries to cookies:", err);
		}
	}

	deleteEntry(id: string) {
		delete this.entries[id];

		let entryValues = Object.values(this.entries);
		if (entryValues.length === 0) this.range = { min: NaN, max: NaN };
		else {
			let priorities = entryValues.map(entry => entry.priority);
			this.range.max = Math.max(...priorities);
			this.range.min = Math.min(...priorities);
		}

		this.updateCookies();
	}

	addEntry(entry: Entry) {
		this.entries[entry.getID()] = entry;

		if (Number.isNaN(this.range.max) || entry.priority > this.range.max)
			this.range.max = entry.priority;
		if (Number.isNaN(this.range.min) || entry.priority < this.range.min)
			this.range.min = entry.priority;

		this.updateCookies();
	}

	editEntry(id: string, updatedEntry: Entry) {
		this.deleteEntry(id);
		this.addEntry(updatedEntry);
	}

	setSorting(newSorting: SortingState) {
		this.sorting = newSorting;
		this.updateCookies();
	}
}

export const dashboardStore = new DashboardStore();
