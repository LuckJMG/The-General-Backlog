import { parse, serialize } from "cookie";
import { Entry } from "./entry";
import type { SortingState } from "@tanstack/table-core";

class DashboardStore {
	entries = $state<Entry[]>([]);
	sorting = $state<SortingState>([{ desc: true, id: "priority" }]);

	constructor() {
		try {
			let cookies = parse(document.cookie);
			this.entries = cookies.entries ? JSON.parse(cookies.entries) : this.entries;
			this.sorting = cookies.sorting ? JSON.parse(cookies.sorting) : this.sorting;
		}
		catch (err) {
			console.warn("Could not parse entries from cookies:", err);
		}
	}

	updateCookies() {
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
		} catch (err) {
			console.error("Failed to save entries to cookies:", err);
		}
	}

	deleteEntry(id: string) {
		this.entries = this.entries.filter(entry => entry.id !== id);
		this.updateCookies();
	}

	addEntry(entry: Entry) {
		this.entries.push(entry);
		this.updateCookies();
	}

	setSorting(newSorting: SortingState) {
		this.sorting = newSorting;
		this.updateCookies();
	}
}

export const dashboardStore = new DashboardStore();
