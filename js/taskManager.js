class TaskManager {
    constructor() {
        this.tasks = Storage.getTasks();
        this.projects = Storage.getProjects();
        this.currentProject = 'all';
        this.currentFilter = 'all';
        this.currentDateFilter = 'all';
        this.searchQuery = '';
    }

    addTask(task) {
        this.tasks.push(task);
        Storage.saveTasks(this.tasks);
    }

    updateTask(id, updatedTask) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, ...updatedTask } : task
        );
        Storage.saveTasks(this.tasks);
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        Storage.saveTasks(this.tasks);
    }

    toggleComplete(id) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        Storage.saveTasks(this.tasks);
    }

    addProject(projectName) {
        if (!this.projects.includes(projectName)) {
            this.projects.push(projectName);
            Storage.saveProjects(this.projects);
            return true;
        }
        return false;
    }

    deleteProject(projectName) {
        this.projects = this.projects.filter(project => project !== projectName);
        // Also remove project from tasks
        this.tasks = this.tasks.map(task => 
            task.project === projectName ? { ...task, project: 'Inbox' } : task
        );
        Storage.saveProjects(this.projects);
        Storage.saveTasks(this.tasks);
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        // Filter by project/view
        if (this.currentProject !== 'all') {
            if (this.currentProject === 'today') {
                const today = new Date().toISOString().split('T')[0];
                filteredTasks = filteredTasks.filter(task => task.dueDate === today);
            } else if (this.currentProject === 'important') {
                filteredTasks = filteredTasks.filter(task => task.important);
            } else if (this.currentProject === 'completed') {
                filteredTasks = filteredTasks.filter(task => task.completed);
            } else {
                filteredTasks = filteredTasks.filter(task => task.project === this.currentProject);
            }
        }

        // Filter by priority
        if (this.currentFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === this.currentFilter);
        }

        // Filter by date
        if (this.currentDateFilter !== 'all') {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            
            filteredTasks = filteredTasks.filter(task => {
                if (!task.dueDate) return false;
                
                const taskDate = new Date(task.dueDate);
                
                switch (this.currentDateFilter) {
                    case 'today':
                        return task.dueDate === todayStr;
                    case 'week':
                        const nextWeek = new Date(today);
                        nextWeek.setDate(today.getDate() + 7);
                        return taskDate >= today && taskDate <= nextWeek;
                    case 'month':
                        const nextMonth = new Date(today);
                        nextMonth.setMonth(today.getMonth() + 1);
                        return taskDate >= today && taskDate <= nextMonth;
                    case 'overdue':
                        return taskDate < today && !task.completed;
                    default:
                        return true;
                }
            });
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(query) || 
                (task.description && task.description.toLowerCase().includes(query))
            );
        }

        return filteredTasks;
    }

    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }
}