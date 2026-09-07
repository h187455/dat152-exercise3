const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskbox.css',import.meta.url)}">

	<dialog>
	   <!-- Modal content -->
	   <span class="close-btn" style="cursor: pointer;">&times;</span>
	   <div>
	       <div>Title:</div>
	       <div>
	          <input type="text" size="25" maxlength="80" placeholder="Task title" autofocus/>
	       </div>
	       <div>Status:</div>
	       <div>
	           <select></select>
	       </div>
	   </div>
	   <p><button type="submit">Add task</button></p>
	</dialog>
`;

/**
  * TaskView
  * Manage the whole view
  */
class TaskBox extends HTMLElement {

    constructor() {
        super();
		const copy = template.content.cloneNode(true);
		this.appendChild(copy);
		
		// Store references to internal DOM elements
		this.dialog = this.querySelector("dialog");
		this.titleInput = this.querySelector("input[type='text']");
		this.statusSelect = this.querySelector("select");
		this.addBtn = this.querySelector("button[type='submit']");
		this.closeBtn = this.querySelector("span");
		
		// Array to hold registered callbacks
		this.callbacks = [];
		
		// Close when clicking the 'x'
		this.closeBtn.addEventListener("click", () => {
			this.close();
		});
		
		// Submit new task when clicking 'Add task'
		this.addBtn.addEventListener("click", (event) => {
			event.preventDefault();

			const title = this.titleInput.value.trim();
			const status = this.statusSelect.value;

			if (title.length === 0) {
				return;
			}

			const newTask = {
				title: title,
				status: status
			};

			// Run all registered callbacks with newTask
			this.callbacks.forEach((callback) => callback(newTask));
		});	
    }

	/**
	 * Opens (shows) the modal box in the browser window
	 * @public
	*/
	show() {
	   this.titleInput.value = "";
	   if (this.dialog && typeof this.dialog.showModal === "function") {
	    	this.dialog.showModal();
	   }
	}
	
	/**
	 * Closes the modal box
	 * @public
	*/
	close() {
	   if (this.dialog && this.dialog.open) {
           this.dialog.close();
	   }
	}
	
	/**
	 * Sets the list of possible task statuses
	 * @public
	 * @param {Array<string>} list - Array of statuses (e.g. ["WAITING", "ACTIVE", "DONE"])
	*/
	setStatuseslist(list) {
		// Clear previous options using DOM manipulation (no unsafe innerHTML)
	    while (this.statusSelect.firstChild) {
	       this.statusSelect.removeChild(this.statusSelect.firstChild);
		}

		// Populate options safely
		list.forEach((status) => {
			const option = document.createElement("option");
			option.value = status;
			option.textContent = status;
			this.statusSelect.appendChild(option);
	    });
	}
	
	/**
	 * Adds a callback to run on clicking the 'Add task' button
	 * @public
	 * @param {Function} callback - Function receiving the new task object: (task) => {}
	*/
	addNewtaskCallback(callback) {
		if (typeof callback === "function") {
			this.callbacks.push(callback);
		}
	}
}
customElements.define('group8-taskbox', TaskBox);
