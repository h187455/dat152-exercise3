import "../tasklist/tasklist.js";
import "../taskbox/taskbox.js";

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskview.css', import.meta.url)}">
    <h1>Tasks</h1>
    <div id="message"><p>Waiting for server data.</p></div>
    <div id="newtask">
        <button type="button" disabled>New task</button>
    </div>
    <!-- The task list -->
    <group8-tasklist></group8-tasklist>
    <!-- The Modal -->
    <group8-taskbox></group8-taskbox>
`;


class TaskView extends HTMLElement {
	#taskbox;
	#tasklist;
	#newTaskBtn;
	#url = null;
	
	constructor() {
	    super();
	    const copy = template.content.cloneNode(true);
	    this.appendChild(copy);

	    this.#taskbox = this.querySelector("group8-taskbox");
	    this.#tasklist = this.querySelector("group8-tasklist");
	    this.#newTaskBtn = this.querySelector("#newtask button");

	    this.#newTaskBtn.addEventListener("click", () => {
	        this.#taskbox.show();
	    });

	    this.#taskbox.addNewtaskCallback(async (task) => {
	        await this.#postNewTask(task);
	    });

	    this.#tasklist.addChangestatusCallback(async (id, newStatus) => {
	        await this.#putTaskStatus(id, newStatus);
	    });

	    this.#tasklist.addDeletetaskCallback(async (id) => {
	        await this.#deleteTask(id);
	    });
	}

    // Helper to sync message and button
	#updateMessage() {
	    const messageP = this.querySelector("#message p");
	    this.#newTaskBtn.disabled = false;
	    const count = this.#tasklist.getNumtasks();
	    if (count > 0) {
	        messageP.textContent = `Found ${count} tasks.`;
	    } else {
	        messageP.textContent = "No tasks were found.";
	    }
	}	
	/**
	 * Helper method to fetch statuses and distribute them.
	 * @param {string} baseUrl - The URL from data-serviceurl
	*/
	async #loadStatuses() {
	    try {
	        const response = await fetch(`${this.#url}/allstatuses`);
	        if (response.ok === true) {
	            const data = await response.json();
	            if (data.responseStatus === true) {
	                this.#taskbox.setStatuseslist(data.allstatuses);
	                this.#tasklist.setStatuseslist(data.allstatuses);
	            }
	        } else {
	            console.log(`Status code: ${response.status}`);
	        }
	    } catch (e) {
	        console.log(`Got error ${e.message}.`);
	    }
	}

	
	/**
     * Helper method to fetch the list of existing tasks from the server.
     * Keeps the connectedCallback clean.
     * @param {string} baseUrl - The URL from data-serviceurl
     */
	async #loadTasks() {
	    try {
	        const response = await fetch(`${this.#url}/tasklist`);
	        if (response.ok === true) {
	            const data = await response.json();
	            if (data.responseStatus === true) {
	                for (const task of data.tasks) {
	                    this.#tasklist.showTask(task);
	                }
	                this.#updateMessage();
	            }
	        } else {
	            console.log(`Failed to load tasks. Status code: ${response.status}`);
	        }
	    } catch (error) {
	        console.log(`Error fetching tasks: ${error.message}`);
	    }
	}

	
	/**
     * Helper method to send a new task to the server and update the UI.
     * @param {string} baseUrl - The URL from data-serviceurl
     * @param {Object} taskData - The new task object {title, status}
     * @param {HTMLElement} taskbox - Reference to the TaskBox component
     * @param {HTMLElement} tasklist - Reference to the TaskList component
     */
	async #postNewTask(taskData) {
	    try {
	        const response = await fetch(`${this.#url}/task`, {
	            method: "POST",
	            headers: { "Content-Type": "application/json; charset=utf-8" },
	            body: JSON.stringify(taskData)
	        });
	        if (response.ok === true) {
	            const data = await response.json();
	            if (data.responseStatus === true) {
	                this.#tasklist.showTask(data.task);
	                this.#taskbox.close();
	                this.#updateMessage();
	            }
	        } else {
	            console.log(`Failed to add task. Status code: ${response.status}`);
	        }
	    } catch (error) {
	        console.log(`Error adding task: ${error.message}`);
	    }
	}

	
	/**
     * Helper method to send a PUT request to update a task's status.
     * @param {string} baseUrl - The URL from data-serviceurl
     * @param {number} id - The ID of the task to update
     * @param {string} newStatus - The new status (e.g., "ACTIVE", "DONE")
     * @param {HTMLElement} tasklist - Reference to the TaskList component
     */
	async #putTaskStatus(id, newStatus) {
	    try {
	        const response = await fetch(`${this.#url}/task/${id}`, {
	            method: "PUT",
	            headers: { "Content-Type": "application/json; charset=utf-8" },
	            body: JSON.stringify({ status: newStatus })
	        });
	        if (response.ok === true) {
	            const data = await response.json();
	            if (data.responseStatus === true) {
	                this.#tasklist.updateTask({ id: id, status: newStatus });
	            }
	        } else {
	            console.log(`Failed to update task. Status code: ${response.status}`);
	        }
	    } catch (error) {
	        console.log(`Error updating task status: ${error.message}`);
	    }
	}

	
	/**
     * Helper method to send a DELETE request to remove a task.
     * @param {string} baseUrl - The URL from data-serviceurl
     * @param {number} id - The ID of the task to delete
     * @param {HTMLElement} tasklist - Reference to the TaskList component
     */
	async #deleteTask(id) {
	    try {
	        const response = await fetch(`${this.#url}/task/${id}`, {
	            method: "DELETE"
	        });
	        if (response.ok === true) {
	            const data = await response.json();
	            if (data.responseStatus === true) {
	                this.#tasklist.removeTask(id);
	                this.#updateMessage();
	            }
	        } else {
	            console.log(`Failed to delete task. Status code: ${response.status}`);
	        }
	    } catch (error) {
	        console.log(`Error deleting task: ${error.message}`);
	    }
	}

	async connectedCallback() {
	    if (this.#url !== null) {
	        return;
	    }
	    this.#url = this.getAttribute("data-serviceurl");
	    if (this.#url === null) {
	        console.error("group8-taskview: missing data-serviceurl");
	        return;
	    }
	    await this.#loadStatuses();
	    await this.#loadTasks();
	}


}

customElements.define('group8-taskview', TaskView);