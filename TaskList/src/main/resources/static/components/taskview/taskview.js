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

/**
 * TaskView
 * Manage the whole view
 */
class TaskView extends HTMLElement {

    constructor() {
        super();
        const copy = template.content.cloneNode(true);
        this.appendChild(copy);
    }

    connectedCallback() {
        const url = this.getAttribute("data-serviceurl");
        const taskbox = this.querySelector("group8-taskbox");
        const tasklist = this.querySelector("group8-tasklist");
        const newTaskBtn = this.querySelector("#newtask button");
        const messageDiv = this.querySelector("#message");

        // Open modal when button is clicked
        newTaskBtn.addEventListener("click", () => {
            taskbox.show();
        });

        // Callback jab user modal se new task submit kare
        taskbox.addNewtaskCallback(async (task) => {
            try {
                const response = await fetch(`${url}/task`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                    body: JSON.stringify(task)
                });
                const result = await response.json();

                if (result.responseStatus) {
                    tasklist.showTask(result.task);
                    taskbox.close();
                    // Update task count message
                }
            } catch (err) {
                console.error("Failed to add task:", err);
            }
        });

        // Yahan server se allstatuses aur tasklist fetch karein
    }
}

customElements.define('group8-taskview', TaskView);