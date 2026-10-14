import "../tasklist/tasklist.js";
import "../taskbox/taskbox.js";

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskview.css', import.meta.url)}">
    <h1>Tasks</h1>
	<div id="message">
        <p id="messageText">Waiting for server data.</p>
    </div>    
	<div id="newtask">
        <button id="newTaskBtn" type="button" disabled>New task</button>
    </div>
    <!-- The task list -->
    <group8-tasklist id="tasklistComponent"></group8-tasklist>
    <!-- The Modal -->
    <group8-taskbox id="taskboxComponent"></group8-taskbox>
`;


class TaskView extends HTMLElement {
	#shadow;
	#taskbox;
	#tasklist;
	#newTaskBtn;
	#messageText;
	#url = null;
	
	constructor() {
	    super();
		// Isolate the component DOM tree through shadow DOM
		this.#shadow = this.attachShadow({ mode: 'closed' });
	    const copy = template.content.cloneNode(true);
	    this.#shadow.appendChild(copy);

		// Store references using the much faster getElementById
		this.#taskbox = this.#shadow.getElementById("taskboxComponent");
	    this.#tasklist = this.#shadow.getElementById("tasklistComponent");
	    this.#newTaskBtn = this.#shadow.getElementById("newTaskBtn");
		this.#messageText = this.#shadow.getElementById("messageText");

		// Event listeners belong in the constructor so they are only added once
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
	    this.#newTaskBtn.disabled = false;
	    const count = this.#tasklist.getNumtasks();
	    if (count > 0) {
	        this.#messageText.textContent = `Found ${count} tasks.`;
	    } else {
	        this.#messageText.textContent = "No tasks were found.";
	    }
	}	
	/**
	 * Helper method to fetch statuses and distribute them.
	*/
	async #loadStatuses() {
	    try {
	        const response = await fetch(`${this.#url}/allstatuses`);
			
			// Property ok is a boolean that indicates if response was successful
	        if (response.ok === true) {				
	            const data = await response.json();
				
				// The responseStatus property has value true if statuses were found
	            if (data.responseStatus === true) {
					
					// Pass the fetched statuses to both components using their public APIs
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
     */
	async #loadTasks() {
	    try {
			// Send GET request to retrieve all existing tasks
	        const response = await fetch(`${this.#url}/tasklist`);
	        if (response.ok === true) {
	            const data = await response.json();
				
				// The responseStatus property has value true if tasks were found
	            if (data.responseStatus === true) {
					
					// Loop through the array of tasks and add them to the view
	                for (const task of data.tasks) {
	                    this.#tasklist.showTask(task);
	                }
					
					// Update the "Found X tasks" message and enable the "New task" button
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
			// Send POST request to add a task to the database
	        const response = await fetch(`${this.#url}/task`, {
	            method: "POST",
				
				// The service expects the data with the following content type
	            headers: { "Content-Type": "application/json; charset=utf-8" },
				
				// Data for the new task must be sent as JSON with properties title and status
	            body: JSON.stringify(taskData)
	        });
	        if (response.ok === true) {
	            const data = await response.json();
				
				// The view should be modified only if responseStatus is true
	            if (data.responseStatus === true) {
					
					// The new task will be added to the top of the list
	                this.#tasklist.showTask(data.task);
					
					// The modal box should close
	                this.#taskbox.close();
					
					// Update the "Found X tasks" counter
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
     * @param {number} id - The ID of the task to update
     * @param {string} newStatus - The new status (e.g., "ACTIVE", "DONE")
     */
	async #putTaskStatus(id, newStatus) {
	    try {
			// Send PUT request to update the specific task using its id
	        const response = await fetch(`${this.#url}/task/${id}`, {
	            method: "PUT",
				
				// The service expects the data to be sent with this exact content type
	            headers: { "Content-Type": "application/json; charset=utf-8" },
				
				// Data for the new status must be sent as JSON with a property 'status'
	            body: JSON.stringify({ status: newStatus })
	        });
	        if (response.ok === true) {
	            const data = await response.json();
				
				// The view should be modified only if responseStatus is true
	            if (data.responseStatus === true) {
					// Update the task in the TaskList view using its public API
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
     * @param {number} id - The ID of the task to delete
     */
	async #deleteTask(id) {
	    try {
			// Send DELETE request to remove the task from the database
	        const response = await fetch(`${this.#url}/task/${id}`, {
	            method: "DELETE"
	        });
	        if (response.ok === true) {
	            const data = await response.json();
				
				// The view should be modified only if responseStatus is true
	            if (data.responseStatus === true) {
					// Remove the task from the view using its numerical id
	                this.#tasklist.removeTask(id);
					
					// Update the "Found X tasks" counter since the list size changed
	                this.#updateMessage();
	            }
	        } else {
	            console.log(`Failed to delete task. Status code: ${response.status}`);
	        }
	    } catch (error) {
	        console.log(`Error deleting task: ${error.message}`);
	    }
	}

	// runs every time the element is inserted into the DOM.
	// If a component is removed from the DOM and re-added later, connectedCallback fires again
	async connectedCallback() {
		// The guard prevents duplicate fetches if the component is moved in the DOM
	    if (this.#url !== null) {
	        return;
	    }
		
	    this.#url = this.getAttribute("data-serviceurl");
	    if (this.#url === null) {
	        console.error("group8-taskview: missing data-serviceurl");
	        return;
	    }
		
		// Fetch statues and tasklist
	    await this.#loadStatuses();
	    await this.#loadTasks();
	}

}

customElements.define('group8-taskview', TaskView);