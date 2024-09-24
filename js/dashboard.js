const ROW_ID = "row-";
let backlog = new Backlog();
let body = document.getElementsByTagName("tbody")[0];

/** Rows of the dashboard. @type {HTMLTableRowElement} */
let rows = [];
let columns = [
	Column.SELECTION,
	Column.TITLE,
	Column.SCORE,
	Column.DURATION,
	Column.PRIORITY,
];

let priorityLimits = {
	max: 0,
	min: 0,
}

/**
* Returns the index of the column in the dashboard.
* @param {Column} column Column to find its index.
* @returns {number} Index of the column in the dashboard.
*/
function getColumnIndex(column) {
	return columns.indexOf(column);
}

/**
* Updates the dashboard with the new state.
*/
function updateDashboard() {
	document.getElementsByTagName("h1")[0].innerHTML = backlog.name;

	rows.map(row => row.remove());
	priorityLimits = backlog.getPriorityLimits();
	priorityLimits.min = priorityLimits.min === priorityLimits.max ? 
		0 : priorityLimits.min;

	let entries = Object.values(backlog.entries);
	entries = Backlog.sortEntries(entries, 
		backlog.sortOrder.column, 
		backlog.sortOrder.reverse);
	entries.map(entry => insertRow(entry));
}

/**
* Inserts a new row in the dashboard.
* @param {Entry} Entry to add to the dashboard.
*/
function insertRow(entry) {
	let row = body.insertRow(1);
	rows.push(row);
	row.id = ROW_ID + Entry.getId(entry.title);

	const insertCell = (column, value) => {
		let cell = row.insertCell(getColumnIndex(column));
		cell.innerHTML = value;
		return cell;
	}

	let checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.onclick = showDeleteButton;
	let checkboxCell = row.insertCell(getColumnIndex(Column.SELECTION));
	checkboxCell.appendChild(checkbox);

	let titleCell = insertCell(Column.TITLE, entry.title);
	titleCell.onclick = () => enableEditing(entry.title);

	insertCell(Column.SCORE, entry.score);
	insertCell(Column.DURATION, entry.duration);

	let priority = entry.priority;
	let range = priorityLimits.max - priorityLimits.min;
	
	let minScale = backlog.prioritySettings.min;
	let maxScale = backlog.prioritySettings.max;
	let scale = maxScale - minScale;
	let scaledPriority = (priority - priorityLimits.min) / range;
	scaledPriority = scaledPriority * scale + minScale;
	insertCell(Column.PRIORITY, Math.round(scaledPriority));
}

/**
* Gets the input to add a new entry to the backlog and updates
* the dashboard.
*/
function addNewEntry() {
	// Get values
	let titleInput = document.getElementById(
		"add_entry_" + Column.TITLE
	);
	let title = titleInput.value;
	if (title === "") return;

	if (backlog.includesEntry(Entry.getId(title))) return;

	let scoreInput = document.getElementById(
		"add_entry_" + Column.SCORE
	);
	let score = scoreInput.value;
	if (score === "") return;
	score = parseInt(score);

	let durationInput = document.getElementById(
		"add_entry_" + Column.DURATION
	);
	let duration = parseFloat(durationInput.value);
	if (duration === "") return;
	duration = parseInt(duration);

	// Reset inputs
	titleInput.value = "";
	scoreInput.value = "";
	durationInput.value = "";

	// Add entry to backlog
	backlog.addEntry(title, score, duration);

	// Update dashboard
	updateDashboard();
}

/**
* Removes the selected entries of the backog and updates the dashboard.
*/
function deleteEntries() {
	rows.map(row => {
		if (!row.firstChild.firstChild.checked) return;
		backlog.deleteEntry(row.id.replace(ROW_ID, ""));
		row.remove();
	})

	updateDashboard();
}

/**
* Enables the editing of an entry in the dashboard.
* @param {string} title The title of the entry to enable editing.
*/
function enableEditing(entryId) {
	let row = document.getElementById(ROW_ID + entryId);

	const addInput = (name, value, column) => {
		let input = document.createElement("input");
		input.type = "text";
		input.value = value;
		input.id = name + "_" + entryId;
		input.required = true;

		let cell = row.children[column];
		cell.innerHTML = "";
		cell.appendChild(input);
	}

	let entry = backlog.entries[entryId];
	addInput("title", entry.title, getColumnIndex(Column.TITLE));
	addInput("score", entry.score, getColumnIndex(Column.SCORE));
	addInput("duration", entry.duration, getColumnIndex(Column.DURATION));

	let acceptButton = document.createElement("button");
	acceptButton.innerHTML = "Accept";
	acceptButton.onclick = () => editRow(row);
	let priorityCell = row.children[getColumnIndex(Column.PRIORITY)];
	priorityCell.innerHTML = "";
	priorityCell.appendChild(acceptButton);
}

function editRow(row) {
	let titleInput = row.children[getColumnIndex(Column.TITLE)].firstChild;
	let newTitle = titleInput.value;
	let entryId = row.id.replace(ROW_ID, "");
	if (newTitle !== backlog.entries[entryId].title 
		&& backlog.includesEntry(Entry.getId(newTitle)))
		return;

	let scoreInput = row.children[getColumnIndex(Column.SCORE)].firstChild;
	let newScore = parseFloat(scoreInput.value);
	let durationInput = row.children[getColumnIndex(Column.DURATION)].firstChild;
	let newDuration = parseFloat(durationInput.value);
	backlog.editEntry(entryId, newTitle, newScore, newDuration);
	updateDashboard();
}

/**
* Shows the delete button when a row in the dashboard is selected.
*/
function showDeleteButton() {
	let selected = rows.some(row => {
		return row.firstChild.firstChild.checked;
	});
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
	rows.map(row => {
		row.firstChild.firstChild.checked = isSelected;
	});
	showDeleteButton();
}

/**
* Sort the rows by the selected colum.
* @param {Column} column Column to sort by.
*/
function sortRows(column) {
	if (column === backlog.sortOrder.column) {
		backlog.sortOrder.reverse = !backlog.sortOrder.reverse;
	}
	else {
		backlog.sortOrder.column = column;
		backlog.sortOrder.reverse = false;
	}

	updateDashboard();
}

/**
* Change the dashboard name.
*/
function changeDashboardName() {
	let nameElement = document.getElementsByTagName("h1")[0];
	let inline = document.createElement("inline");
	inline.id = "inline_change_name"
	nameElement.after(inline);
	nameElement.remove();

	let input = document.createElement("input");
	input.value = backlog.name;
	input.id = "change_backlog_name";

	let button = document.createElement("button");
	button.innerHTML = "Change Name";
	button.onclick = () => {
		let inline = document.getElementById("inline_change_name");
		let newName = inline.firstChild.value;
		if (newName === "") return;
		backlog.name = newName;
		let h1 = document.createElement("h1");
		h1.innerHTML = newName;
		h1.onclick = changeDashboardName;
		inline.after(h1);
		inline.remove();
	}

	inline.appendChild(input);
	inline.appendChild(button);
}

/**
* Export backlog as JSON file.
*/
function exportBacklog() {
	let blob = new Blob([JSON.stringify(backlog, null, 2)], { 
		type: "application/json" 
	});
	let url = URL.createObjectURL(blob);
	let link = document.getElementById("export_backlog");
	link.href = url;
	link.download = backlog.name + ".json";
}

/**
* Import backlog with JSON file.
*/
async function importBacklog() {
	let fileInput = document.getElementById("import_backlog");
	let file = fileInput.files[0];
	fileInput.value = '';
	let rawBacklog = JSON.parse(await file.text());
	for (let property in rawBacklog)
		backlog[property] = rawBacklog[property];
	updateDashboard();
}
