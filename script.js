// Elemente aus dem DOM abrufen
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');

// Aufgaben aus localStorage laden
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Aufgaben beim Laden der Seite anzeigen
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
});

// Event Listener für Button
addBtn.addEventListener('click', addTask);

// Event Listener für Enter-Taste
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Neue Aufgabe hinzufügen
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Bitte geben Sie eine Aufgabe ein!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

// Aufgaben rendern
function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Löschen</button>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

// Aufgabe als erledigt markieren
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Aufgabe löschen
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// Statistiken aktualisieren
function updateStats() {
    totalCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(t => t.completed).length;
}

// Aufgaben in localStorage speichern
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// HTML-Zeichen escapen (Sicherheit)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
