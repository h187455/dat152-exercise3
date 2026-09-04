const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('tasklist.css',import.meta.url)}">

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {

    constructor() {
        super();
        /**
         * Fill inn rest of the code
         */
		const copy = template.content.cloneNode(true);
		this.appendChild(copy);
		
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
	
    setStatuseslist(allstatuses) {
		this.statuses = allstatuses;
		const select = taskrow.content.querySelector("select");
		const optionT = select.querySelector("option");
		
		for (const status of allstatuses) {
			const option = optionT.cloneNode(true);
			option.value = status;
			option.textContent = status;
			option.selected = false;
			select.appendChild(option);
		}
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    addChangestatusCallback(callback) {
		this.changeStatusCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    addDeletetaskCallback(callback) {
		this.deleteTaskCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        /**
         * Fill inn the code
         */
		const container = this.querySelector("#tasklist");
		let table = container.querySelector("table");
		
		if (table === null) {
			const tableCopy = tasktable.content.cloneNode(true);
			container.appendChild(tableCopy);
			table = container.querySelector("table");
		}
		const row = taskrow.content.cloneNode(true);
		const cells = row.querySelectorAll("td");
		
		cells[0].textContent = task.title;
		cells[1].textContent = task.status;
		
		const selectedRow = row.querySelector("tr");
		selectedRow.dataset.id = task.id;
		
		const select = row.querySelector("select");
		const button = row.querySelector("button");
		
		select.addEventListener("change", ()=> {
			const newStatus = select.value;
			const confirmed = window.confirm(`Change status of "${task.title}" to ${newStatus}?`);
			
			
			if (confirmed) {
				this.changeStatusCallback(task.id, newStatus);
			}
			
			select.value = "0";
		});
		
		const tbody = table.querySelector("tbody");
		tbody.prepend(row);
		
		button.addEventListener("click", () => {
		    const confirmed = window.confirm(
		        `Delete "${task.title}"?`
		    );

		    if (confirmed) {
		        this.deleteTaskCallback(task.id);
		    }
		});
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        /**
         * Fill inn the code
         */
		const row = this.querySelector(`tr[data-id="${task.id}"]`);
		
		if (row) {
			const cells = row.querySelectorAll("td");
			cells[1].textContent = task.status;
		}
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        /**
         * Fill inn the code
         */
		const row = this.querySelector(`tr[data-id="${id}"]`);
		if (row) {
			row.remove();
		}
		if (this.getNumtasks() === 0) {
			const container = this.querySelector("#tasklist");
			container.innerHTML = "";
		}
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        /**
         * Fill inn the code
         */
		const rows = this.querySelectorAll("tbody tr");
		return rows.length;
    }
}
customElements.define('groupx-tasklist', TaskList);
