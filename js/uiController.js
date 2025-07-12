class UIController {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.currentEditingTaskId = null;
        this.initElements();
        this.initEventListeners();
        this.applyTheme();
    }

    initElements() {
        this.elements = {
            taskList: document.getElementById('taskList'),
            taskForm: document.getElementById('taskForm'),
            taskModal: document.getElementById('taskModal'),
            taskTitle: document.getElementById('taskTitle'),
            taskDescription: document.getElementById('taskDescription'),
            taskDueDate: document.getElementById('taskDueDate'),
            taskPriority: document.getElementById('taskPriority'),
            taskProject: document.getElementById('taskProject'),
            taskImportant: document.getElementById('taskImportant'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            closeModal: document.querySelector('.close-modal'),
            themeToggle: document.getElementById('themeToggle'),
            taskSearch: document.getElementById('taskSearch'),
            priorityFilter: document.getElementById('priorityFilter'),
            dateFilter: document.getElementById('dateFilter'),
            newProjectName: document.getElementById('newProjectName'),
            addProjectBtn: document.getElementById('addProjectBtn'),
            projectsList: document.querySelector('.projects-list'),
            sidebarMenu: document.querySelectorAll('.sidebar-menu button'),
            tasksHeader: document.getElementById('tasksHeader'),
            modalTitle: document.getElementById('modalTitle')
        };
    }

    initEventListeners() {
        // Modal handling
        this.elements.addTaskBtn.addEventListener('click', () => this.openTaskModal());
        this.elements.closeModal.addEventListener('click', () => this.closeTaskModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.taskModal) this.closeTaskModal();
        });

        // Form submission
        this.elements.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Search
        this.elements.taskSearch.addEventListener('input', (e) => {
            this.taskManager.searchQuery = e.target.value;
            this.renderTasks();
        });

        // Filters
        this.elements.priorityFilter.addEventListener('change', (e) => {
            this.taskManager.currentFilter = e.target.value;
            this.renderTasks();
        });

        this.elements.dateFilter.addEventListener('change', (e) => {
            this.taskManager.currentDateFilter = e.target.value;
            this.renderTasks();
        });

        // Projects
        this.elements.addProjectBtn.addEventListener('click', () => this.handleAddProject());
        this.elements.newProjectName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddProject();
        });

        // Sidebar menu
        this.elements.sidebarMenu.forEach(button => {
            button.addEventListener('click', () => {
                this.elements.sidebarMenu.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.taskManager.currentProject = button.dataset.view;
                this.updateTasksHeader();
                this.renderTasks();
            });
        });
    }

    applyTheme() {
        const savedTheme = Storage.getTheme();
        document.body.className = savedTheme;
        this.updateThemeIcon(savedTheme);
    }

    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'dark-theme' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'light-theme' : 'dark-theme';
        document.body.className = currentTheme;
        Storage.saveTheme(currentTheme);
        this.updateThemeIcon(currentTheme);
    }

    openTaskModal(taskId = null) {
        this.currentEditingTaskId = taskId;
        
        if (taskId) {
            const task = this.taskManager.getTaskById(taskId);
            if (task) {
                this.elements.modalTitle.textContent = 'Edit Task';
                this.elements.taskTitle.value = task.title;
                this.elements.taskDescription.value = task.description || '';
                this.elements.taskDueDate.value = task.dueDate || '';
                this.elements.taskPriority.value = task.priority;
                this.elements.taskProject.value = task.project || 'Inbox';
                this.elements.taskImportant.checked = task.important || false;
            }
        } else {
            this.elements.modalTitle.textContent = 'Add New Task';
            this.elements.taskTitle.value = '';
            this.elements.taskDescription.value = '';
            this.elements.taskDueDate.value = '';
            this.elements.taskPriority.value = 'medium';
            this.elements.taskProject.value = 'Inbox';
            this.elements.taskImportant.checked = false;
        }
        
        this.elements.taskModal.style.display = 'flex';
        this.elements.taskTitle.focus();
    }

    closeTaskModal() {
        this.elements.taskModal.style.display = 'none';
        this.currentEditingTaskId = null;
    }

    handleTaskSubmit() {
        const taskData = {
            title: this.elements.taskTitle.value,
            description: this.elements.taskDescription.value,
            dueDate: this.elements.taskDueDate.value || null,
            priority: this.elements.taskPriority.value,
            project: this.elements.taskProject.value,
            important: this.elements.taskImportant.checked,
            completed: false
        };

        if (this.currentEditingTaskId) {
            // Update existing task
            this.taskManager.updateTask(this.currentEditingTaskId, taskData);
        } else {
            // Add new task
            const newTask = {
                ...taskData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
            this.taskManager.addTask(newTask);
        }

        this.closeTaskModal();
        this.renderTasks();
        this.renderProjects();
    }

    handleAddProject() {
        const projectName = this.elements.newProjectName.value.trim();
        if (projectName && this.taskManager.addProject(projectName)) {
            this.elements.newProjectName.value = '';
            this.renderProjects();
        }
    }

    renderTasks() {
        const tasks = this.taskManager.getFilteredTasks();
        this.elements.taskList.innerHTML = '';

        if (tasks.length === 0) {
            this.elements.taskList.innerHTML = '<p class="no-tasks">No tasks found</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.elements.taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        // Check if task is overdue
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = task.dueDate && task.dueDate < today && !task.completed;

        li.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <div class="task-title ${task.completed ? 'completed' : ''}">
                    ${task.important ? '<i class="fas fa-exclamation-circle task-important"></i>' : ''}
                    ${task.title}
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    ${task.dueDate ? `
                        <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="far fa-calendar-alt"></i> ${this.formatDate(task.dueDate)}
                        </div>
                    ` : ''}
                    <div class="task-priority priority-${task.priority}">
                        ${task.priority}
                    </div>
                    ${task.project && task.project !== 'Inbox' ? `
                        <div class="task-project">
                            <i class="fas fa-folder"></i> ${task.project}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-task" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-task" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Add event listeners to the buttons we just created
        const checkbox = li.querySelector('.task-checkbox input');
        checkbox.addEventListener('change', () => {
            this.taskManager.toggleComplete(task.id);
            this.renderTasks();
        });

        const editBtn = li.querySelector('.edit-task');
        editBtn.addEventListener('click', () => this.openTaskModal(task.id));

        const deleteBtn = li.querySelector('.delete-task');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                this.taskManager.deleteTask(task.id);
                this.renderTasks();
            }
        });

        return li;
    }

    renderProjects() {
        const projects = this.taskManager.projects;
        this.elements.projectsList.innerHTML = '';
        this.elements.taskProject.innerHTML = '<option value="inbox">Inbox</option>';

        projects.forEach(project => {
            if (project === 'Inbox') return;
            
            // Add to sidebar
            const li = document.createElement('li');
            li.dataset.project = project;
            li.innerHTML = `
                ${project}
                <button class="delete-project"><i class="fas fa-trash"></i></button>
            `;
            
            const deleteBtn = li.querySelector('.delete-project');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete project "${project}" and move its tasks to Inbox?`)) {
                    this.taskManager.deleteProject(project);
                    this.renderProjects();
                    this.renderTasks();
                }
            });
            
            li.addEventListener('click', () => {
                this.taskManager.currentProject = project;
                this.updateTasksHeader();
                this.renderTasks();
                // Update active button
                this.elements.sidebarMenu.forEach(btn => btn.classList.remove('active'));
            });
            
            this.elements.projectsList.appendChild(li);
            
            // Add to project dropdown in modal
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            this.elements.taskProject.appendChild(option);
        });
    }

    updateTasksHeader() {
        const view = this.taskManager.currentProject;
        let headerText = 'All Tasks';
        
        if (view === 'today') headerText = 'Today\'s Tasks';
        else if (view === 'important') headerText = 'Important Tasks';
        else if (view === 'completed') headerText = 'Completed Tasks';
        else if (view !== 'all') headerText = `${view} Tasks`;
        
        this.elements.tasksHeader.textContent = headerText;
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    init() {
        this.renderProjects();
        this.renderTasks();
        this.updateTasksHeader();
    }
}