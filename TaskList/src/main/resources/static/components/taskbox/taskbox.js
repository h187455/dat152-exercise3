const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskbox.css',import.meta.url)}">

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

/**
  * TaskView
  * Manage the whole view
  */
class TaskBox extends HTMLElement {

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
	
}
customElements.define('group8-taskbox', TaskBox);
