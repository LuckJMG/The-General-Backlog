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

		/** List of entries of the backlog. @type {Obj.<string, Entry>} */
		this.entries = {};

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
		delete this.entries[entryId];
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
		console.log(json);
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

}
