document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
    const uiController = new UIController(taskManager);
    uiController.init();
});document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
    const uiController = new UIController(taskManager);
    uiController.init();
    const taskList = document.getElementById('taskList');
    if (taskList) {
        new Sortable(taskList, {
            animation: 150,
            onEnd: function (evt) {
                // TODO: Update task order in storage
            }
        });
    }
});

if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

function showDueTaskNotification(task) {
    if (Notification.permission === 'granted') {
        new Notification('Task Due!', {
            body: `${task.title} is due today.`,
            icon: 'images/icons/icon-144x144.png'
        });
    }
}
// Call showDueTaskNotification(task) when a task is due

document.getElementById('exportDataBtn').onclick = function() {
    const data = localStorage.getItem('todoData');
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo-backup.json';
    a.click();
    URL.revokeObjectURL(url);
};

document.getElementById('importDataBtn').onclick = function() {
    document.getElementById('importDataInput').click();
};
document.getElementById('importDataInput').onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        localStorage.setItem('todoData', evt.target.result);
        location.reload();
    };
    reader.readAsText(file);
};

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'n') {
        document.getElementById('addTaskBtn').click();
        e.preventDefault();
    }
    // Add more shortcuts as needed
});

document.getElementById('themeToggle').addEventListener('click', function() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    }
});

// On page load, set theme from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(savedTheme);
    }
});