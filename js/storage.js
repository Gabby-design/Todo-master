class Storage {
    static getTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    static saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    static getProjects() {
        const projects = localStorage.getItem('projects');
        return projects ? JSON.parse(projects) : ['Inbox', 'Work', 'Personal'];
    }

    static saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    static getTheme() {
        return localStorage.getItem('theme') || 'light-theme';
    }

    static saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }
}