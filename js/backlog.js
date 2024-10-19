/*
* The container of the backlog state.
*/
class Backlog {
	/**
	* @constructor
	*/
	constructor() {
		/** Name of the backlog. @type {string} */
		this.name = "The General Backlog";

		/** Sort order of the entries. @type {Obj.<Column, boolean>} */
		this.sortOrder = {
			column: Column.PRIORITY,
			reverse: false,
		};

		/**
		* Priority settings.
		* @type {Obj.<number, number>}
		*/
		this.prioritySettings = {
			min: 0,
			max: 100,
		}

		/** List of entries of the backlog. @type {Obj.<string, Entry>} */
		this.entries = {};
	}

	/**
	* Checks if the title exists in the backlog.
	* @param {string} entryId Id of the entry to check.
	* @returns {boolean} If the title alerady exists or not.
	*/
	includesEntry(entryId) {
		return this.entries[entryId] !== undefined;
	}

	/**
	* Adds an entry to the list of entries.
	* @param {string} title Title of the new entry.
	* @param {number} score Score of the new entry.
	* @param {number} duration Duration of the new entry.
	* @returns {Entry} New entry created.
	*/
	addEntry(title, score, duration) {
		let newEntry = new Entry(title, score, duration);
		this.entries[Entry.getId(title)] = newEntry;
	}

	/**
	* Removes an entry by its title from the backlog.
	* @param {string} entryId Id of the entry to remove.
	*/
	deleteEntry(entryId) {
		delete this.entries[entryId];
	}

	/**
	* Edits and entry by its title.
	* @param {string} entryId The id of the entry to edit.
	* @param {string} newTitle The new title of the entry.
	* @param {number} newScore The new score of the entry.
	* @param {number} newDuration The new duration of the entry.
	*/
	editEntry(entryId, newTitle, newScore, newDuration) {
		this.entries[entryId].edit(newTitle, newScore, newDuration);
		this.entries[Entry.getId(newTitle)] = this.entries[entryId];
		if (entryId !== Entry.getId(newTitle)) delete this.entries[entryId];
	}

	/**
	* Returns the max and min priorities of the backlog.
	* @returns {Obj.<number, number>}
	*/
	getPriorityLimits() {
		let entryList = Object.values(this.entries);
		return { 
			max: Math.max(...entryList.map(entry => entry.priority)),
			min: Math.min(...entryList.map(entry => entry.priority)),
		};
	}

	/**
	* Sorts the entries by a given column.
	* @static
	* @param {Entry[]} entries Entries to sort.
	* @param {Column} column The column to sort the entries.
	* @param {boolean} [reverse=false] Flag to reverse the sorted entries.
	* @returns {Entry[]} Array of sorted entries.
	*/
	static sortEntries(entries, column, reverse=false) {
		switch(column) {
			case Column.TITLE:
				entries.sort((a, b) => (a.title < b.title) ? 1 : -1);
				break;
			case Column.SCORE:
				entries.sort((a, b) => a.score - b.score);
				break;
			case Column.DURATION:
				entries.sort((a, b) => a.duration - b.duration);
				break;
			default:
				entries.sort((a, b) => a.priority - b.priority);
		}

		if (reverse) entries.reverse();
		return entries;
	}

	/**
	* Loads a backlog from JSON.
	* @param {string} JSON as string.
	*/
	loadFromJSON(json) {
		let rawBacklog = JSON.parse(json);

		for (let property in rawBacklog)
			this[property] = rawBacklog[property];

		for (let key in rawBacklog.entries) {
			let rawEntry = rawBacklog.entries[key];
			let newEntry = new Entry("", 0, 1);
			for (let property in rawEntry)
				newEntry[property] = rawEntry[property];
			this.entries[key] = newEntry;
		}
	}

	/**
	* Generates a string as CSV from the state of the backlog.
	*/
	exportToCSV() {
		let csv = "name,sortOrder.column,sortOrder.reverse\n";
		csv += `"${this.name}",${this.sortOrder.column},${this.sortOrder.reverse}\n`

		for (let column in Column) {
			csv += Column[column] + ","
		}
		csv = csv.slice(0, csv.length-1) + '\n';

		for (let key in this.entries) {
			let entry = this.entries[key];
			for (let property in entry) {
				csv += `"${entry[property]}",`
			}
			csv = csv.slice(0, csv.length-1) + '\n';
		}
		
		return csv;
	}

	/**
	* Loads the backlog from a CSV file.
	* @param {string} csv Text from a CSV file.
	*/
	loadFromCSV(csv) {
		let lines = csv.split("\n");
		lines = lines.slice(0, lines.length-1);
		let settings = {
			keys: lines[0].split(","),
			values: lines[1].split(","),
		}

		for (let i = 0; i < settings.keys.length; i++) {
			this[settings.keys[i]] = settings.values[i]
										.slice(1, settings.values[i].length-1);
		}
		this.sortOrder.reverse = this.sortOrder.reverse === "true";

		console.log(lines);
		let entryProperties = lines[2].split(",");
		for (let i = 3; i < lines.length; i++) {
			let entry = lines[i].split(",");

			let newEntry = new Entry ("", 0, 1);
			for (let j = 0; j < entryProperties.length; j++) {
				newEntry[entryProperties[j]] = entry[j]
												.slice(1, entry[j].length-1);
			}

			newEntry.score = parseFloat(newEntry.score);
			newEntry.duration = parseFloat(newEntry.duration);
			newEntry.priority = parseFloat(newEntry.priority);

			this.entries[Entry.getId(newEntry.title)] = newEntry;
		}
	}
}
