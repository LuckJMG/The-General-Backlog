/**
* Column types
* @enum {string}
*/
const Column = {
	TITLE: "Title",
	SCORE: "Score",
	TIME: "Time",
	PRIORITY: "Priority",
};

const SCALE = 100;
let entries = [];
let maxPriority = 10;
let minPriority = 0;
let sortOrder = {
	column: Column.PRIORITY,
	reverse: false,
};

/**
* Adds an entry to the list of entries by retrieving the input given
* in the add_entry section.
*/
function addEntry() {
	// Get values
	let title = document.getElementById("add_entry_title").value;
	if (title === "") return;

	if (entries.filter(entry => entry.title === title).length !== 0) return;

	let score = document.getElementById("add_entry_score").value;
	if (score === "") return;
	score = parseInt(score);

	let time = parseFloat(document.getElementById("add_entry_time").value);
	if (time === "") return;
	time = parseInt(time);

	// Reset inputs
	document.getElementById("add_entry_title").value = "";
	document.getElementById("add_entry_score").value = "";
	document.getElementById("add_entry_time").value = "";

	// Add to database
	let entry = {
		"title": title,
		"score": score,
		"time": time,
		"priority": score / time,
	};
	entries.push(entry);

	maxPriority = Math.max(...entries.map(entry => entry.priority));
	minPriority = Math.min(...entries.map(entry => entry.priority));
	minPriority = maxPriority === minPriority ? 0 : minPriority;

	sortEntries(sortOrder, true);
}

/**
* Deletes selected entries on dashboard from the list of entries.
*/
function deleteEntries() {
	// Get all checkboxes
	let checkboxList = Array.from(document.getElementsByTagName("input"))
		.filter(input => {
			return input.type === "checkbox"
				&& input.checked === true
				&& input.id !== "select_all";
		});

	// Get entries to delete
	let rows = checkboxList.map(checkbox => {
		return checkbox.parentElement.parentElement;
	});

	// Remove entries from database
	let titles = rows.map(row => row.children[1].innerHTML);
	entries = entries.filter(entry => !titles.includes(entry.title));
	
	// Remove rows of deleted entries
	rows.map(row => row.remove());
}

/**
* Sorts the entries by a given column and updates the dashboard.
* @param {Column} column The column to sort the entries.
* @param {boolean} [maintainOrder=false] Flag to maintain the order or
*	invert it.
*/
function sortEntries(column, maintainOrder = false) {
	if (column === sortOrder.column && !maintainOrder) {
		sortOrder.reverse = !sortOrder.reverse;
	}
	
	switch(column) {
		case Column.TITLE:
			entries.sort((a, b) => (a.title > b.title) ? 1 : -1);
			if (!maintainOrder) sortOrder.column = Column.TITLE;
			break;
		case Column.SCORE:
			entries.sort((a, b) => a.score - b.score);
			if (!maintainOrder) sortOrder.column = Column.SCORE;
			break;
		case Column.TIME:
			entries.sort((a, b) => a.time - b.time);
			if (!maintainOrder) sortOrder.column = Column.TIME;
			break;
		default:
			entries.sort((a, b) => a.priority - b.priority);
			if (!maintainOrder) sortOrder.column = Column.PRIORITY;
	}

	if (sortOrder.reverse) entries.reverse();

	const dashboard_body = document.getElementsByTagName("tbody")[0];
	Array.from(dashboard_body.children).map(row => row.remove());

	const empty_row = document.createElement("tr");
	empty_row.style.display = "none";
	dashboard_body.appendChild(empty_row);
	entries.map(entry => insertToDashboard(entry));
}

/**
* Edits an entry and updates the dashboard accordingly.
* @params {Object} entry The entry to edit.
*/
function editEntry(entry) {
	let entryId = entry.title.replace(" ", "_");
	let entryIndex = entries.findIndex(a => a.title === entry.title);

	let titleInput = document.getElementById("title_" + entryId);
	let newTitle = titleInput.value;
	if (newTitle !== entry.title && entries.some(a => a.title === newTitle))
		return;
	entries[entryIndex].title = titleInput.value;

	let scoreInput = document.getElementById("score_" + entryId);
	entries[entryIndex].score = parseInt(scoreInput.value);

	let timeInput = document.getElementById("time_" + entryId);
	entries[entryIndex].time = parseInt(timeInput.value);

	entries[entryIndex].priority = entries[entryIndex].score / entries[entryIndex].time;

	maxPriority = Math.max(...entries.map(entry => entry.priority));
	minPriority = Math.min(...entries.map(entry => entry.priority));
	minPriority = maxPriority === minPriority ? 0 : minPriority;
	sortEntries(sortOrder.column, true);
}

/**
* Inserts a new entry to the dashboard and updates it.
* @param {Object} entry Entry to add to dashboard.
*/
function insertToDashboard(entry) {
	let dashboard = document.getElementById("dashboard").children[1];
	let row = dashboard.insertRow(1);
	row.id = "entry_" + entry.title.replace(" ", "_");

	let checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.onclick = showDeleteButton;
	let checkboxCell = row.insertCell(0);
	checkboxCell.appendChild(checkbox);

	let titleCell = row.insertCell(1);
	titleCell.innerHTML = entry.title;
	titleCell.onclick = () => enableEditing(entry.title);

	let scoreCell = row.insertCell(2);
	scoreCell.innerHTML = entry.score;

	let timeCell = row.insertCell(3);
	timeCell.innerHTML = entry.time;

	let priorityCell = row.insertCell(4);
	let range = maxPriority - minPriority;
	let scaledPriority = ((entry.priority - minPriority) / range) * SCALE;
	priorityCell.innerHTML = Math.round(scaledPriority);
}

/**
* Enables the editing of an entry in the dashboard.
* @param {string} title The title of the entry to enable editing.
*/
function enableEditing(title) {
	sortEntries(sortOrder.column, true);
	let entryId = title.replace(" ", "_");
	let entry = entries.find(a => a.title === title);
	let row = document.getElementById("entry_" + entryId);

	let titleInput = document.createElement("input");
	titleInput.type = "text";
	titleInput.value = title;
	titleInput.id = "title_" + entryId;
	titleInput.required = true;
	let titleCell = row.children[1];
	titleCell.innerHTML = "";
	titleCell.appendChild(titleInput);

	let scoreInput = document.createElement("input");
	scoreInput.type = "number";
	scoreInput.value = entry.score;
	scoreInput.id = "score_" + entryId;
	scoreInput.required = true;
	let scoreCell = row.children[2];
	scoreCell.innerHTML = "";
	scoreCell.appendChild(scoreInput);

	let timeInput = document.createElement("input");
	timeInput.type = "number";
	timeInput.value = entry.time;
	timeInput.id = "time_" + entryId;
	timeInput.required = true;
	let timeCell = row.children[3];
	timeCell.innerHTML = "";
	timeCell.appendChild(timeInput);

	let acceptButton = document.createElement("button");
	acceptButton.innerHTML = "Accept";
	acceptButton.onclick = () => editEntry(entry);
	let priorityCell = row.children[4];
	priorityCell.innerHTML = "";
	priorityCell.appendChild(acceptButton);
}

/**
* Shows the delete button when a row in the dashboard is selected.
*/
function showDeleteButton() {
	// Get all checkboxes
	let checkboxList = Array.from(document.getElementsByTagName("input"))
		.filter(input => input.type === "checkbox");

	// Check if any are selected
	let selected = checkboxList.some(checkbox => checkbox.checked === true);
	let deleteButton = document.getElementById("delete_button");

	if (selected && !deleteButton) {
		deleteButton = document.createElement("button");
		deleteButton.innerHTML = "Delete";
		deleteButton.id = "delete_button";
		deleteButton.onclick = deleteEntries;

		const menu = document.getElementById("menu");
		menu.appendChild(deleteButton);
	}
	else if (!selected) {
		deleteButton.remove();
	}
}

/**
* Selects all rows on the dashboard.
*/
function selectAllEntries() {
	let isSelected = document.getElementById("select_all").checked;

	Array.from(document.getElementsByTagName("input"))
		.filter(input => input.type === "checkbox" && input.id !== "select_all")
		.map(checkbox => checkbox.checked = isSelected);

	showDeleteButton();
}

