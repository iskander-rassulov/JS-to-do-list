// Load tasks from localStorage or initialize empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Get references to DOM elements
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskPrioritySelect = document.getElementById('taskPriority');
const taskDateInput = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');

const sortSelect = document.getElementById('sortSelect');
const taskList = document.getElementById('taskList');

// --- Add new task ---
addTaskBtn.addEventListener('click', addTask);

function addTask() {
  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const priority = Number(taskPrioritySelect.value); // 3,2,1,0
  const date = taskDateInput.value; // "YYYY-MM-DD" or ""

  // Validate title (at least)
  if (!title) {
    alert('Please enter at least a title for your task!');
    return;
  }

  const newTask = {
    id: Date.now(),
    title: title,
    description: description,
    priority: priority,
    date: date, // could be empty
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  // Clear input fields
  taskTitleInput.value = '';
  taskDescriptionInput.value = '';
  taskPrioritySelect.value = '0'; // reset to "None"
  taskDateInput.value = '';
}

// --- Save to localStorage ---
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- Render tasks on the page ---
function renderTasks() {
  taskList.innerHTML = '';

  // Sort tasks before rendering
  if (sortSelect.value === 'date') {
    // Sort by date (empty dates go last)
    tasks.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });
  } else if (sortSelect.value === 'priority') {
    // Sort by priority (higher => top)
    tasks.sort((a, b) => b.priority - a.priority);
  }

  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item', 'fade-in');

    // If date is set and it's past due, mark as expired
    if (task.date) {
      const currentDate = new Date();
      const taskDate = new Date(task.date);
      if (taskDate < currentDate) {
        taskItem.classList.add('expired');
      }
    }

    // Title
    const titleEl = document.createElement('div');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title;
    titleEl.addEventListener('click', () => {
      editField(titleEl, task, 'title', 'text');
    });

    // Description
    const descriptionEl = document.createElement('div');
    descriptionEl.className = 'task-description';
    descriptionEl.textContent = task.description || '';
    descriptionEl.addEventListener('click', () => {
      editField(descriptionEl, task, 'description', 'textarea');
    });

    // Priority & Date container
    const metaEl = document.createElement('div');
    metaEl.className = 'task-meta';

    // Priority
    const priorityEl = document.createElement('span');
    priorityEl.className = 'task-priority';
    priorityEl.textContent = priorityToText(task.priority);
    priorityEl.addEventListener('click', () => {
      editPriority(priorityEl, task);
    });

    // Date
    const dateEl = document.createElement('span');
    dateEl.className = 'task-date';
    dateEl.textContent = task.date || 'No date';
    dateEl.addEventListener('click', () => {
      editField(dateEl, task, 'date', 'date');
    });

    metaEl.appendChild(priorityEl);
    metaEl.appendChild(dateEl);

    // Button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'task-btn';
    deleteBtn.addEventListener('click', () => {
      deleteTask(task.id, taskItem);
    });

    buttonGroup.appendChild(deleteBtn);

    // Assemble
    taskItem.appendChild(titleEl);
    taskItem.appendChild(descriptionEl);
    taskItem.appendChild(metaEl);
    taskItem.appendChild(buttonGroup);

    taskList.appendChild(taskItem);
  });
}

// --- Delete task ---
function deleteTask(id, taskItem) {
  taskItem.classList.remove('fade-in');
  taskItem.classList.add('fade-out');

  taskItem.addEventListener('animationend', () => {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
  });
}

// --- Inline editing (title, date, description) ---
function editField(element, task, field, inputType) {
  const oldValue = element.textContent === 'No date' ? '' : element.textContent;

  // If we edit the "description" using a textarea
  if (inputType === 'textarea') {
    const textarea = document.createElement('textarea');
    textarea.value = oldValue;
    textarea.style.width = '100%';
    textarea.rows = 4;
    element.replaceWith(textarea);
    textarea.focus();

    textarea.addEventListener('blur', () => {
      const newValue = textarea.value.trim();
      task[field] = newValue;
      saveTasks();
      renderTasks();
    });
    // Enter => blur
    textarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        textarea.blur();
      }
    });
  } else {
    // For text, date, etc.
    const input = document.createElement('input');
    input.type = inputType; // 'text' or 'date'
    input.value = oldValue;
    element.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
      const newValue = input.value.trim();
      task[field] = newValue;
      saveTasks();
      renderTasks();
    });
    // Enter => blur
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  }
}

// --- Inline editing for priority (replace with select) ---
function editPriority(element, task) {
  const oldValue = task.priority;
  const select = document.createElement('select');
  select.innerHTML = `
    <option value="3" ${oldValue === 3 ? 'selected' : ''}>High</option>
    <option value="2" ${oldValue === 2 ? 'selected' : ''}>Medium</option>
    <option value="1" ${oldValue === 1 ? 'selected' : ''}>Low</option>
    <option value="0" ${oldValue === 0 ? 'selected' : ''}>None</option>
  `;
  element.replaceWith(select);
  select.focus();

  select.addEventListener('blur', () => {
    task.priority = Number(select.value);
    saveTasks();
    renderTasks();
  });
}

// --- Convert priority number to text ---
function priorityToText(num) {
  switch (num) {
    case 3:
      return 'High';
    case 2:
      return 'Medium';
    case 1:
      return 'Low';
    default:
      return 'None';
  }
}

// --- Re-render on dropdown change (sort) ---
sortSelect.addEventListener('change', () => {
  renderTasks();
});

// --- Initial render ---
renderTasks();
