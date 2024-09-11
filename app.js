let entries = []

function calculate_priority(score, time) {
	let priority = score / time
	return priority * 100
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
	entries.push({
		"title": title,
		"score": score,
		"time": time,
		"priority": priority
	})

	// Insert into dashboard
	const dashboard = document.getElementById("dashboard")
	const entry = dashboard.insertRow(1)

	const checkbox = document.createElement("input")
	checkbox.type = "checkbox"
	checkbox.onclick = show_delete
	const checkbox_cell = entry.insertCell(0)
	checkbox_cell.appendChild(checkbox)

	const title_cell = entry.insertCell(1)
	title_cell.innerHTML = title

	const score_cell = entry.insertCell(2)
	score_cell.innerHTML = score

	const time_cell = entry.insertCell(3)
	time_cell.innerHTML = time

	const priority_cell = entry.insertCell(4)
	priority_cell.innerHTML = priority
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
