const ROW_ID = "row-";

let backlog = new Backlog();
let body = document.getElementsByTagName("tbody")[0];

/** @type {HTMLTableRowElement} */
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

loadBacklogCookies();

/**
* @param {Column} column
* @returns {number}
*/
function getColumnIndex(column) {
	return columns.indexOf(column);
}

function updateDashboard() {
	document.getElementsByTagName("h1")[0].innerHTML = backlog.name;

	priorityLimits = backlog.getPriorityLimits();
	priorityLimits.min = priorityLimits.min === priorityLimits.max ? 
		0 : priorityLimits.min;

	updateRows();

	let columnHeaders = [
		...document.getElementsByTagName("thead")[0].children[0].children
	];
	columnHeaders.slice(1, columnHeaders.length).map(
	column => {
		if (column.id === "column-" + backlog.sortOrder.column) {
			let icon = column.children[1];
			icon.src = "icons/sort-down.svg";
			icon.style.transform = `scale(${
				backlog.sortOrder.reverse ? -1 : 1
			})`;

			return;
		}
		column.children[1].src = "icons/sort.svg";
	});

	document.cookie = JSON.stringify(backlog);
}

function updateRows() {
	rows.map(row => row.remove());
	let entries = Object.values(backlog.entries);
	entries = Backlog.sortEntries(entries,
		backlog.sortOrder.column,
		backlog.sortOrder.reverse);
	entries.map(entry => insertRow(entry));
}

/**
* @param {Entry} entry
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
	titleCell.onclick = () => enableEditing(Entry.getId(entry.title));

	let scoreCell = insertCell(Column.SCORE, entry.score);
	scoreCell.className = "number";
	let durationCell = insertCell(Column.DURATION, entry.duration);
	durationCell.className = "number";

	let priority = entry.priority;
	let range = priorityLimits.max - priorityLimits.min;
	
	let minScale = backlog.prioritySettings.min;
	let maxScale = backlog.prioritySettings.max;
	let scale = maxScale - minScale;
	let scaledPriority = (priority - priorityLimits.min) / range;
	scaledPriority = scaledPriority * scale + minScale;
	let priorityCell = insertCell(Column.PRIORITY, Math.round(scaledPriority));
	priorityCell.className = "number";

	appendHoverMenu(row, Entry.getId(entry.title))
}

function appendHoverMenu(row, entryId) {
	const toggleHoverMenu = () => {
		let hoverMenu = document.getElementById(`hover_menu_${entryId}`);
		hoverMenu.classList.toggle('show-inline-flex');
	}

	let hoverMenu = createHoverMenu(entryId);
	row.appendChild(hoverMenu);
	row.onmouseover = toggleHoverMenu;
	row.onmouseout = toggleHoverMenu;
}

function createHoverMenu(entryId) {
	const HOVER_MENU_ELEMENT = `
	<button class="hover-button" onclick="showEditMenu('${entryId}')"><img src="icons/file-edit.svg"></button>
	<button class="hover-button" onclick="showDeleteWarning('${entryId}')"><img src="icons/trash.svg"></button>
	`;
	let hoverMenu = document.createElement('div');
	hoverMenu.classList = "hover-menu";
	hoverMenu.id = `hover_menu_${entryId}`;
	hoverMenu.innerHTML = HOVER_MENU_ELEMENT.trim();
	return hoverMenu;
}

function addNewEntry() {
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

	titleInput.value = "";
	scoreInput.value = "";
	durationInput.value = "";

	backlog.addEntry(title, score, duration);

	document.getElementById("add_entry_menu").classList.toggle("show")
	updateDashboard();
}

function deleteEntries() {
	rows.map(row => {
		if (!row.firstChild.firstChild.checked) return;
		backlog.deleteEntry(row.id.replace(ROW_ID, ""));
		row.remove();
	})

	updateDashboard();
}

/**
* @param {string} title
*/
function enableEditing(entryId) {
	let row = document.getElementById(ROW_ID + entryId);
	row.children[1].onclick = "";

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

/**
* @param {HTMLTableRowElement} row
*/
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

function selectAllEntries() {
	let isSelected = document.getElementById("select_all").checked;
	rows.map(row => {
		row.firstChild.firstChild.checked = isSelected;
	});
	showDeleteButton();
}

/**
* @param {Column} column
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
		document.cookie = JSON.stringify(backlog);
	}

	inline.appendChild(input);
	inline.appendChild(button);

}

/**
* @param {string} filtype
*/
function exportBacklog(filetype) {
	let blob = filetype === "json" ? 
		new Blob([JSON.stringify(backlog, null, 2)], { 
			type: "application/json" 
		}) : 
		new Blob([backlog.exportToCSV()], {
			type: "text/plain"
		});
	let url = URL.createObjectURL(blob);
	let link = document.getElementById(filetype === "json" ? 
		"export_json" : "export_csv");
	link.href = url;
	link.download = backlog.name + (filetype === "json" ? ".json" : ".csv");
}

/**
* @param {File} [file]
*/
async function importBacklog(file=null) {
	let fileInput = document.getElementById("manual_import_backlog");
	file = file === null ? fileInput.files[0] : file;
	let name = file.name;
	fileInput.value = '';
	if (name.slice(name.length - 5, name.length) === ".json") {
		backlog.loadFromJSON(await file.text());
	}
	else if (name.slice(name.length - 4, name.length) === ".csv"){
		backlog.loadFromCSV(await file.text());
	}

	updateDashboard();
}

/**
* @param {DragEvent} event
*/
function dropHandler(event) {
	event.preventDefault();

	if (event.dataTransfer.items) {
		importBacklog(event.dataTransfer.items[0].getAsFile());
	}
	else {
		importBacklog(event.dataTransfer.files[0]);
	}

	document.getElementById("import_backlog")
		.children[1].classList.toggle("show");
}

function loadBacklogCookies() {
	if (document.cookie === "") return;
	backlog.loadFromJSON(document.cookie);
	updateDashboard();
}

/**
* @param {string} dropwdownId
*/
function showDropdown(dropdownId) {
	document.getElementById(dropdownId).children[1].classList.toggle("show");
}
