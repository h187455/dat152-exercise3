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
    constructor() {
        super();
        const copy = template.content.cloneNode(true);
        this.appendChild(copy);
    }

    // Helper to sync message and button
    updateMessage() {
        const messageP = this.querySelector("#message p");
        const newTaskBtn = this.querySelector("#newtask button");
        const tasklist = this.querySelector("group8-tasklist");

        newTaskBtn.disabled = false;
        const count = tasklist.getNumtasks();

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
	async #loadStatuses(baseUrl) {
        try {
            // Send GET request to retrieve all possible task states
            const response = await fetch(`${baseUrl}/allstatuses`); 
            
            // Property ok is a boolean that indicates if response was successful
            if (response.ok) { 
                const data = await response.json(); 
                
                // The responseStatus property has value true if statuses were found
                if (data.responseStatus) {
                    const taskbox = this.querySelector("group8-taskbox");
                    const tasklist = this.querySelector("group8-tasklist");
                    
                    // Pass the fetched statuses to both components using their public APIs
                    taskbox.setStatuseslist(data.allstatuses);
                    tasklist.setStatuseslist(data.allstatuses);
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
    async #loadTasks(baseUrl) {
        try {
            // Send GET request to retrieve all existing tasks
            const response = await fetch(`${baseUrl}/tasklist`); 
            
            if (response.ok) {
                const data = await response.json();
                
                // The responseStatus property has value true if tasks were found
                if (data.responseStatus) {
                    const tasklist = this.querySelector("group8-tasklist");
                    
                    // Loop through the array of tasks and add them to the view[cite: 3, 4]
                    for (let task of data.tasks) {
                        tasklist.showTask(task);
                    }
                    
                    // Update the "Found X tasks" message and enable the "New task" button
                    this.updateMessage();
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
    async #postNewTask(baseUrl, taskData, taskbox, tasklist) {
        try {
            // Send POST request to add a task to the database
            const response = await fetch(`${baseUrl}/task`, {
                method: "POST",
                // The service expects the data with the following content type
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                // Data for the new task must be sent as JSON with properties title and status
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                const data = await response.json();
                
                // The view should be modified only if responseStatus is true
                if (data.responseStatus) {
                    // The new task will be added to the top of the list
                    tasklist.showTask(data.task);
                    
                    // The modal box should close
                    taskbox.close();
                    
                    // Update the "Found X tasks" counter
                    this.updateMessage();
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
    async #putTaskStatus(baseUrl, id, newStatus, tasklist) {
        try {
            // Send PUT request to update the specific task using its id
            const response = await fetch(`${baseUrl}/task/${id}`, {
                method: "PUT",
                // The service expects the data to be sent with this exact content type
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                // Data for the new status must be sent as JSON with a property 'status'
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const data = await response.json();
                
                // The view should be modified only if responseStatus is true
                if (data.responseStatus) {
                    // Update the task in the TaskList view using its public API
                    tasklist.updateTask({
                        id: id,
                        status: newStatus
                    });
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
    async #deleteTask(baseUrl, id, tasklist) {
        try {
            // Send DELETE request to remove the task from the database
            const response = await fetch(`${baseUrl}/task/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                const data = await response.json();
                
                // The view should be modified only if responseStatus is true
                if (data.responseStatus) {
                    // Remove the task from the view using its numerical id
                    tasklist.removeTask(id);
                    
                    // Update the "Found X tasks" counter since the list size changed
                    this.updateMessage();
                }
            } else {
                console.log(`Failed to delete task. Status code: ${response.status}`);
            }
        } catch (error) {
            console.log(`Error deleting task: ${error.message}`);
        }
    }

    connectedCallback() {
        const url = this.getAttribute("data-serviceurl");
        const taskbox = this.querySelector("group8-taskbox");
        const tasklist = this.querySelector("group8-tasklist");
        const newTaskBtn = this.querySelector("#newtask button");
		
		// Fetch statues and tasklist
		this.#loadStatuses(url);
		this.#loadTasks(url);

        // 1. Open Modal
        newTaskBtn.addEventListener("click", () => {
            taskbox.show();
        });

        // 2. Handle Add Task Callback
        taskbox.addNewtaskCallback(async (task) => {
			// Pass the data to our helper method to handle the Ajax POST
            this.#postNewTask(url, task, taskbox, tasklist);
        });

        // 3. Handle Modify Status Callback
        tasklist.addChangestatusCallback(async (id, newStatus) => {
            // Pass the ID and the newly selected status to our Ajax helper method
            this.#putTaskStatus(url, id, newStatus, tasklist);
        });

        // 4. Handle Delete Task Callback
        tasklist.addDeletetaskCallback(async (id) => {
			// Pass the ID to our Ajax helper method to execute the DELETE request
            this.#deleteTask(url, id, tasklist);
        });
    }
}

customElements.define('group8-taskview', TaskView);