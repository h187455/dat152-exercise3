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
	
	 #statuses = []; #changeStatusCallback; #deleteTaskCallback;

    constructor() {
        super();
		const copy = template.content.cloneNode(true);
		this.appendChild(copy);
		
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
		this.#statuses = allstatuses;
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    addChangestatusCallback(callback) {
		this.#changeStatusCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    addDeletetaskCallback(callback) {
		this.#deleteTaskCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
	showTask(task) {
	    const container = this.querySelector("#tasklist");
	    let table = container.querySelector("table");

	    if (table === null) {
	        const tableCopy = tasktable.content.cloneNode(true);
	        container.appendChild(tableCopy);
	        table = container.querySelector("table");
	    }

	    const fragment = taskrow.content.cloneNode(true);
	    const tr = fragment.firstElementChild;

	    tr.dataset.id = task.id;
	    tr.cells[0].textContent = task.title;
	    tr.cells[1].textContent = task.status;

	    const select = tr.querySelector("select");

	    // Populate status options from the stored list
	    for (const status of this.#statuses) {
	        const option = document.createElement("option");
	        option.value = status;
	        option.textContent = status;
	        select.appendChild(option);
	    }
	    select.value = "0";

	    select.addEventListener("change", () => {
	        const newStatus = select.value;
	        if (newStatus === tr.cells[1].textContent) {
	            select.value = "0";
	            return;
	        }
	        const confirmed = window.confirm(
	            `Change status of "${task.title}" to ${newStatus}?`
	        );
	        if (confirmed === true && typeof this.#changeStatusCallback === "function") {
	            this.#changeStatusCallback(task.id, newStatus);
	        }
	        select.value = "0";
	    });

	    const button = tr.querySelector("button");
	    button.addEventListener("click", () => {
	        const confirmed = window.confirm(`Delete "${task.title}"?`);
	        if (confirmed === true && typeof this.#deleteTaskCallback === "function") {
	            this.#deleteTaskCallback(task.id);
	        }
	    });

	    table.tBodies[0].prepend(fragment);
	}


    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
	updateTask(task) {
	    const table = this.querySelector("table");
	    if (table === null) {
	        return;
	    }
	    for (const row of table.tBodies[0].rows) {
	        if (row.dataset.id === String(task.id)) {
	            row.cells[1].textContent = task.status;
	            return;
	        }
	    }
	}


    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
	removeTask(id) {
	    const table = this.querySelector("table");
	    if (table !== null) {
	        for (const row of table.tBodies[0].rows) {
	            if (row.dataset.id === String(id)) {
	                row.remove();
	                break;
	            }
	        }
	    }
	    if (this.getNumtasks() === 0) {
	        const container = this.querySelector("#tasklist");
	        container.replaceChildren();
	    }
	}

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
		const table = this.querySelector("table");
		if (table !== null) {
		    return table.tBodies[0].rows.length;
		}
		return 0;
    }
}
customElements.define('group8-tasklist', TaskList);
