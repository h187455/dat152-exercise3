const template = document.createElement("template");
template.innerHTML = `
	<link rel="stylesheet" type="text/css" href="${new URL('taskbox.css',import.meta.url)}">

	<dialog id="taskModal">
	   <!-- Modal content -->
	   <span id="closeBtn" class="close-btn">&times;</span>
	   <div>
	       <div>Title:</div>
	       <div>
	          <input id="taskTitle" type="text" size="25" maxlength="80" placeholder="Task title" autofocus/>
	       </div>
	       <div>Status:</div>
	       <div>
	           <select id="taskStatus"></select>
	       </div>
	   </div>
	   <p><button id="addBtn" type="submit">Add task</button></p>
	</dialog>
`;

/**
  * TaskBox
  * Manage the modal box for adding a new task
  */
class TaskBox extends HTMLElement {
	#shadow;
	#dialog; 
	#titleInput; 
	#statusSelect; 
	#addBtn; 
	#closeBtn; 
	#newTaskCallback = null;
	#statuses = [];

    constructor() {
        super();
		// Isolate the component DOM tree through shadow DOM
		this.#shadow = this.attachShadow({ mode: 'closed' });
		const copy = template.content.cloneNode(true);
		this.#shadow.appendChild(copy);
		
		// Store references using the faster getElementById on the shadow root
		this.#dialog = this.#shadow.getElementById("taskModal");
		this.#titleInput = this.#shadow.getElementById("taskTitle");
		this.#statusSelect = this.#shadow.getElementById("taskStatus");
		this.#addBtn = this.#shadow.getElementById("addBtn");
		this.#closeBtn = this.#shadow.getElementById("closeBtn");
		
		// Close when clicking the 'x'
		this.#closeBtn.addEventListener("click", () => {
			this.close();
		});
		
		// Submit new task when clicking 'Add task'
		this.#addBtn.addEventListener("click", (event) => {
			event.preventDefault();

			const title = this.#titleInput.value.trim();
			const status = this.#statusSelect.value;

			if (title.length === 0) {
				return;
			}

			const newTask = {
				title: title,
				status: status
			};

			// Run the single registered callback
			if (typeof this.#newTaskCallback === "function") {
			    this.#newTaskCallback(newTask);
			}
		});	
    }

	/**
	 * Opens (shows) the modal box in the browser window
	 * @public
	*/
	
	show() {
	    this.#titleInput.value = "";

	    this.#statusSelect.replaceChildren();
	    for (const status of this.#statuses) {
	        const option = document.createElement("option");
	        option.value = status;
	        option.textContent = status;
	        this.#statusSelect.appendChild(option);
	    }
	    this.#statusSelect.selectedIndex = 0;

	    if (this.#dialog !== null && typeof this.#dialog.showModal === "function") {
	        this.#dialog.showModal();
	    }
	}

	
	/**
	 * Closes the modal box
	 * @public
	*/
	close() {
	   if (this.#dialog !== null && this.#dialog.open === true) {
           this.#dialog.close();
	   }
	}
	
	/**
	 * Sets the list of possible task statuses
	 * @public
	 * @param {Array<string>} list - Array of statuses (e.g. ["WAITING", "ACTIVE", "DONE"])
	*/
	setStatuseslist(list) {
	    this.#statuses = list;
	}

	
	/**
	 * Adds a callback to run on clicking the 'Add task' button
	 * @public
	 * @param {Function} callbackFunction receiving the new task object: (task) => {}
	*/
	addNewtaskCallback(callback) {
	    this.#newTaskCallback = callback;
	}
}
customElements.define('group8-taskbox', TaskBox);
