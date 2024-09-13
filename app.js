let entries = []
let sort_order = "Priority"

function calculate_priority(score, time) {
	let priority = score / time
	return priority * 100
}

function insert_to_dashboard(entry) {
	const dashboard = document.getElementById("dashboard").children[1]
	const entry_row = dashboard.insertRow(1)

	const checkbox = document.createElement("input")
	checkbox.type = "checkbox"
	checkbox.onclick = show_delete
	const checkbox_cell = entry_row.insertCell(0)
	checkbox_cell.appendChild(checkbox)

	const title_cell = entry_row.insertCell(1)
	title_cell.innerHTML = entry.title

	const score_cell = entry_row.insertCell(2)
	score_cell.innerHTML = entry.score

	const time_cell = entry_row.insertCell(3)
	time_cell.innerHTML = entry.time

	const priority_cell = entry_row.insertCell(4)
	priority_cell.innerHTML = entry.priority
}

function add_entry() {
	// Get values
	const title = document.getElementById("add_entry_title").value
	if (title === "") return

	if (entries.filter(entry => entry.title === title).length !== 0) return

	let score = document.getElementById("add_entry_score").value
	if (score === "") return
	score = parseInt(score)

	let time = parseFloat(document.getElementById("add_entry_time").value)
	if (time === "") return
	time = parseInt(time)

	// Reset inputs
	document.getElementById("add_entry_title").value = ""
	document.getElementById("add_entry_score").value = ""
	document.getElementById("add_entry_time").value = ""

	// Add to database
	const priority = calculate_priority(score, time)
	const entry = {
		"title": title,
		"score": score,
		"time": time,
		"priority": priority
	}
	entries.push(entry)
	sort_entries(sort_order, false)
}

function show_delete() {
	// Get all checkboxes
	const checkbox_list = Array.from(document.getElementsByTagName("input"))
		.filter(input => input.type === "checkbox")

	// Check if any are selected
	const selected = checkbox_list.some(checkbox => checkbox.checked === true)
	let delete_button = document.getElementById("delete_button")
	if (selected && !delete_button) {
		delete_button = document.createElement("button")
		delete_button.innerHTML = "Delete"
		delete_button.id = "delete_button"
		delete_button.onclick = delete_entries

		const menu = document.getElementById("menu")
		menu.appendChild(delete_button)
	}
	else if (!selected) {
		delete_button.remove()
	}
}

function delete_entries() {
	// Get all checkboxes
	const checkbox_list = Array.from(document.getElementsByTagName("input"))
		.filter(input => input.type === "checkbox" && input.checked === true && input.id !== "select_all")

	// Get entries to delete
	const entry_rows = checkbox_list.map(checkbox => {
		return checkbox.parentElement.parentElement
	})

	// Remove entries from database
	const titles = entry_rows.map(entry_row => entry_row.children[1].innerHTML)
	entries = entries.filter(entry => !titles.includes(entry.title))
	
	// Remove rows of deleted entries
	entry_rows.map(entry_row => entry_row.remove())
}

function select_all() {
	const is_selected = document.getElementById("select_all").checked

	Array.from(document.getElementsByTagName("input"))
		.filter(input => input.type === "checkbox" && input.id !== "select_all")
		.map(checkbox => checkbox.checked = is_selected)

	show_delete()
}

function sort_entries(column, reverse = true) {
	switch(column) {
		case "Title Reverse":
		case "Title":
			entries.sort((a, b) => (a.title > b.title) ? 1 : -1)
			if (reverse) sort_order = sort_order === "Title" ? "Title Reverse" : "Title"
			break;
		case "Score Reverse":
		case "Score":
			entries.sort((a, b) => a.score - b.score)
			if (reverse) sort_order = sort_order === "Score"  ? "Score Reverse" : "Score"
			break;
		case "Time Reverse":
		case "Time":
			entries.sort((a, b) => a.time - b.time)
			if (reverse) sort_order = sort_order === "Time" ? "Score Reverse" : "Time"
			break;
		default:
			entries.sort((a, b) => a.priority - b.priority)
			if (reverse) sort_order = sort_order === "Priority"  ? "Priority Reverse" : "Priority"
	}

	if (sort_order.includes("Reverse")) entries.reverse()

	const dashboard_body = document.getElementsByTagName("tbody")[0]
	Array.from(dashboard_body.children).map(row => row.remove())

	const empty_row = document.createElement("tr")
	empty_row.style.display = "none"
	dashboard_body.appendChild(empty_row)
	entries.map(entry => insert_to_dashboard(entry))
}
