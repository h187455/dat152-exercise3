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
            // Part 2: POST to server
            taskbox.close();
        });

        // 3. Handle Modify Status Callback
        tasklist.addChangestatusCallback(async (id, newStatus) => {
            // Part 2: PUT to server
        });

        // 4. Handle Delete Task Callback
        tasklist.addDeletetaskCallback(async (id) => {
            // Part 2: DELETE to server
        });
    }
}

customElements.define('group8-taskview', TaskView);