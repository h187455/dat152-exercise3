const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskview.css',import.meta.url)}">

	<h1>Tasks</h1>
	
	<!-- The task list -->
	<GROUP8-TASKLIST></GROUP8-TASKLIST>
	
	<!-- The Modal -->
	<GROUP8-TASKBOX></GROUP8-TASKBOX>
`;

const template = document.createElement("template");
template.innerHTML = `
	<div id="message">
		<p>Waiting for server data.</p>
	</div>
`;

const template = document.createElement("template");
template.innerHTML = `
	<div id="newtask">
		<button type="button" disabled>New task</button>
	</div>
`;

/**
  * TaskView
  * Manage the whole view
  */
class TaskView extends HTMLElement {

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
	
	/**
	 * Add task at top in list of tasks in the view
	 * @public
	 * @param {Object} task - Object representing a task
	 */

	
	
}
customElements.define('group8-taskview', TaskView);
