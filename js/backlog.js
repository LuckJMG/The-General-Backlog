class Backlog {
	/**
	* @constructor
	*/
	constructor() {
		/** @type {string} */
		this.name = "The General Backlog";

		/** @type {Obj.<Column, boolean>} */
		this.sortOrder = {
			column: Column.PRIORITY,
			reverse: false,
		};

		/**
		* @type {Obj.<number, number>}
		*/
		this.prioritySettings = {
			min: 0,
			max: 100,
		}

		/** @type {Obj.<string, Entry>} */
		this.entries = {};
	}

	/**
	* @param {string} entryId
	* @returns {boolean}
	*/
	includesEntry(entryId) {
		return this.entries[entryId] !== undefined;
	}

	/**
	* @param {string} title
	* @param {number} score
	* @param {number} duration
	* @returns {Entry}
	*/
	addEntry(title, score, duration) {
		let newEntry = new Entry(title, score, duration);
		this.entries[Entry.getId(title)] = newEntry;
	}

	/**
	* @param {string}
	*/
	deleteEntry(entryId) {
		delete this.entries[entryId];
	}

	/**
	* @param {string} entryId
	* @param {string} newTitle
	* @param {number} newScore
	* @param {number} newDuration
	*/
	editEntry(entryId, newTitle, newScore, newDuration) {
		this.entries[entryId].edit(newTitle, newScore, newDuration);
		this.entries[Entry.getId(newTitle)] = this.entries[entryId];
		if (entryId !== Entry.getId(newTitle)) delete this.entries[entryId];
	}

	/**
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
	* @static
	* @param {Entry[]}
	* @param {Column}
	* @param {boolean} [reverse=false]
	* @returns {Entry[]}
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

	async loadFromFile(file) {
		let extension = getFileExtension(file.name);
		if (extension === ".json") {
			this.loadFromJSON(await file.text());
		}
		else if (extension === ".csv") {
			this.loadFromCSV(await file.text());
		}
	}

	/**
	* @param {string} json
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
	* @param {string} csv
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
