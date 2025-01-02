let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const createTaskBtn = document.getElementById('createTaskBtn');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const searchTask = document.getElementById('searchTask');
const sortTasks = document.getElementById('sortTasks');

createTaskBtn.addEventListener('click', () => {
    taskForm.classList.toggle('hidden');
});

addTaskBtn.addEventListener('click', () => {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const date = document.getElementById('taskDate').value;
    const priority = document.getElementById('taskPriority').value;
    const color = document.getElementById('taskColor').value;
    const imageFile = document.getElementById('taskImage').files[0];

    if (!title) {
        alert('Task Title is required.');
        return;
    }

    if (imageFile) {
        convertToBase64(imageFile, (base64Image) => {
            const task = {
                id: Date.now(),
                title,
                description,
                date,
                priority,
                color,
                image: base64Image,
                completed: false,
            };
            tasks.push(task);
            saveAndRenderTasks();
            taskForm.classList.add('hidden');
            clearForm();
        });
    } else {
        const task = {
            id: Date.now(),
            title,
            description,
            date,
            priority,
            color,
            image: null,
            completed: false,
        };
        tasks.push(task);
        saveAndRenderTasks();
        taskForm.classList.add('hidden');
        clearForm();
    }
});

function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
}

function clearForm() {
    document.getElementById('taskForm').querySelectorAll('input, textarea').forEach((el) => el.value = '');
}

sortTasks.addEventListener('change', saveAndRenderTasks);
searchTask.addEventListener('input', saveAndRenderTasks);

function saveAndRenderTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = tasks
        .filter((task) => {
            const searchText = searchTask.value.toLowerCase();
            return task.title.toLowerCase().includes(searchText) || (task.description || '').toLowerCase().includes(searchText);
        })
        .sort((a, b) => {
            if (sortTasks.value === 'date') return new Date(a.date) - new Date(b.date);
            if (sortTasks.value === 'priority') return a.priority - b.priority;
            return 0;
        });

    filteredTasks.forEach((task) => {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.completed ? 'completed' : ''}`;

        const colorOrImage = task.color || task.image
            ? `<div style="background-color: ${task.color || 'transparent'}; width: 100px; height: 100px; ${
                task.image ? `background-image: url(${task.image}); background-size: cover;` : ''
            }"></div>`
            : '';

        taskElement.innerHTML = `
            ${colorOrImage}
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description || ''}</div>
                <div class="task-meta">
                    <span>Priority: ${task.priority || 'N/A'}</span>
                    <span>${task.date || 'No date'}</span>
                </div>
                <div class="task-actions">
                    <button class="completeTask">✔</button>
                    <button class="editTask">✎</button>
                    <button class="deleteTask">✖</button>
                </div>
            </div>
        `;

        taskElement.querySelector('.completeTask').addEventListener('click', () => {
            task.completed = !task.completed;
            saveAndRenderTasks();
        });

        taskElement.querySelector('.editTask').addEventListener('click', () => {
          // Создаем форму для редактирования
          const editForm = document.createElement('div');
          editForm.className = 'edit-form';
          editForm.innerHTML = `
              <input type="text" id="editTitle" value="${task.title}" placeholder="Task Title" required>
              <textarea id="editDescription" placeholder="Task Description">${task.description || ''}</textarea>
              <input type="date" id="editDate" value="${task.date}">
              <input type="number" id="editPriority" value="${task.priority || ''}" placeholder="Priority (1-10)" min="1" max="10">
              <label>
                  Choose a color:
                  <input type="color" id="editColor" value="${task.color || '#ffffff'}">
              </label>
              <label>
                  Or upload an image:
                  <input type="file" id="editImage" accept="image/*">
              </label>
              <button id="saveEdit">Save</button>
              <button id="cancelEdit">Cancel</button>
          `;
      
          // Заменяем задачу на форму редактирования
          taskElement.replaceWith(editForm);
      
          // Обработчик сохранения изменений
          editForm.querySelector('#saveEdit').addEventListener('click', () => {
              const newTitle = editForm.querySelector('#editTitle').value.trim();
              const newDescription = editForm.querySelector('#editDescription').value.trim();
              const newDate = editForm.querySelector('#editDate').value;
              const newPriority = editForm.querySelector('#editPriority').value;
              const newColor = editForm.querySelector('#editColor').value;
              const newImageFile = editForm.querySelector('#editImage').files[0];
              const newImage = newImageFile ? URL.createObjectURL(newImageFile) : task.image;
      
              if (!newTitle) {
                  alert('Task Title is required.');
                  return;
              }
      
              // Обновляем данные задачи
              task.title = newTitle;
              task.description = newDescription;
              task.date = newDate;
              task.priority = newPriority;
              task.color = newColor;
              task.image = newImage;
      
              saveAndRenderTasks(); // Сохраняем и рендерим обновленный список
          });
      
          // Обработчик отмены редактирования
          editForm.querySelector('#cancelEdit').addEventListener('click', () => {
              saveAndRenderTasks(); // Возвращаем исходный вид
          });
      });

        taskElement.querySelector('.deleteTask').addEventListener('click', () => {
            tasks = tasks.filter((t) => t.id !== task.id);
            saveAndRenderTasks();
        });

        taskList.appendChild(taskElement);
    });
}

saveAndRenderTasks();
