let todos = JSON.parse(localStorage.getItem("todos")) || [];
let draggedItem = null;
let editingIndex = null;
let currentFilter = "all";

function renderList() {
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");

  list.innerHTML = "";

  let filteredTodos = todos;

  if (currentFilter === "completed") {
    filteredTodos = todos.filter(todo => todo.completed);
  } else if (currentFilter === "pending") {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter.startsWith("category-")) {
    const category = currentFilter.replace("category-", "");
    filteredTodos = todos.filter(todo => todo.category === category);
  }

  const searchTerm = document.getElementById("search-box")?.value.toLowerCase() || "";
  if (searchTerm) {
    filteredTodos = filteredTodos.filter(todo =>
      todo.text.toLowerCase().includes(searchTerm) ||
      (todo.description && todo.description.toLowerCase().includes(searchTerm))
    );
  }

  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";
    updateStats();
    return;
  }

  emptyState.style.display = "none";

  filteredTodos.forEach((todo, originalIndex) => {
    const li = document.createElement("li");
    const classes = ["todo-item"];
    if (todo.completed) classes.push("completed");
    if (isOverdue(todo)) classes.push("overdue");
    
    li.className = classes.join(" ");
    li.draggable = true;

    const dueDateElement = todo.dueDate ? `
      <span class="due-date ${isOverdue(todo) ? 'overdue' : ''}">
        📅 ${formatDate(todo.dueDate)}
      </span>
    ` : "";

    const categoryElement = todo.category ? `
      <span class="category-tag">${todo.category}</span>
    ` : "";

    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""} onchange="toggleTodo(${todos.indexOf(todo)})">
      <div class="todo-content">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <div class="todo-meta">
          ${categoryElement}
          ${dueDateElement}
          <span class="priority ${todo.priority}">${getPriorityLabel(todo.priority)}</span>
        </div>
      </div>
      <div class="action-buttons">
        <button class="edit-button" onclick="openEditModal(${todos.indexOf(todo)})">✏️</button>
        <button class="delete-button" onclick="deleteTodo(${todos.indexOf(todo)})">✕</button>
      </div>
    `;

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    list.appendChild(li);
  });

  updateStats();
}

function getPriorityLabel(priority) {
  const labels = {
    high: "Sehr wichtig",
    medium: "Wichtig",
    low: "Weniger wichtig",
  };
  return labels[priority] || "Wichtig";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return "⚠️ Überfällig";
  }
  
  return date.toLocaleDateString("de-DE", { month: "short", day: "numeric" });
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false;
  const dueDate = new Date(todo.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  
  const statsEl = document.getElementById("header-stats");
  if (statsEl) {
    statsEl.innerHTML = `📊 Gesamt: ${total} | ✅ Erledigt: ${completed} | ⏳ Ausstehend: ${pending}`;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function openAddModal() {
  editingIndex = null;
  document.getElementById("modal-title").textContent = "Neue Aufgabe";
  document.getElementById("todo-text").value = "";
  document.getElementById("todo-description").value = "";
  document.getElementById("todo-category").value = "Allgemein";
  document.getElementById("todo-priority").value = "medium";
  document.getElementById("todo-duedate").value = "";
  document.getElementById("add-modal").classList.add("show");
  document.getElementById("todo-text").focus();
}

function openEditModal(index) {
  editingIndex = index;
  const todo = todos[index];
  document.getElementById("modal-title").textContent = "Aufgabe bearbeiten";
  document.getElementById("todo-text").value = todo.text;
  document.getElementById("todo-description").value = todo.description || "";
  document.getElementById("todo-category").value = todo.category || "Allgemein";
  document.getElementById("todo-priority").value = todo.priority || "medium";
  document.getElementById("todo-duedate").value = todo.dueDate || "";
  document.getElementById("add-modal").classList.add("show");
  document.getElementById("todo-text").focus();
}

function closeModal() {
  document.getElementById("add-modal").classList.remove("show");
  editingIndex = null;
}

function saveTodo() {
  const text = document.getElementById("todo-text").value.trim();
  const description = document.getElementById("todo-description").value.trim();
  const category = document.getElementById("todo-category").value;
  const priority = document.getElementById("todo-priority").value;
  const dueDate = document.getElementById("todo-duedate").value;

  if (!text) {
    alert("Bitte gib eine Aufgabe ein!");
    return;
  }

  if (editingIndex !== null) {
    todos[editingIndex] = {
      ...todos[editingIndex],
      text,
      description,
      category,
      priority,
      dueDate
    };
  } else {
    todos.push({
      text,
      description,
      category,
      priority,
      dueDate,
      completed: false
    });
  }

  saveTodos();
  renderList();
  closeModal();
}

function deleteTodo(index) {
  if (confirm("Möchtest du diese Aufgabe löschen?")) {
    todos.splice(index, 1);
    saveTodos();
    renderList();
  }
}

function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  renderList();
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add("active");
  renderList();
}

function handleSearch(value) {
  renderList();
}

// Drag and Drop Funktionen
function handleDragStart(e) {
  draggedItem = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedItem !== this) {
    const allItems = document.querySelectorAll(".todo-item");
    const draggedElement = draggedItem;
    const targetElement = this;
    
    const draggedTodo = todos.find(t => t.text === draggedElement.querySelector(".todo-text").textContent);
    const targetTodo = todos.find(t => t.text === targetElement.querySelector(".todo-text").textContent);
    
    if (draggedTodo && targetTodo) {
      const draggedIdx = todos.indexOf(draggedTodo);
      const targetIdx = todos.indexOf(targetTodo);
      [todos[draggedIdx], todos[targetIdx]] = [todos[targetIdx], todos[draggedIdx]];
      saveTodos();
      renderList();
    }
  }

  return false;
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
}

// Modal schließen wenn außerhalb geklickt
window.onclick = function (event) {
  const modal = document.getElementById("add-modal");
  if (event.target == modal) {
    closeModal();
  }
};

// Enter-Taste zum Speichern
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && e.ctrlKey) {
    const modal = document.getElementById("add-modal");
    if (modal.classList.contains("show")) {
      saveTodo();
    }
  }
});

// Zusatzfunktionen für Kategorien
function getCategories() {
  const categories = new Set(todos.map(t => t.category).filter(c => c));
  return Array.from(categories);
}

function updateCategoryFilters() {
  const filterContainer = document.getElementById("filter-buttons");
  const categories = getCategories();
  
  const categoryButtons = categories.map(cat => 
    `<button class="filter-btn" data-filter="category-${cat}" onclick="setFilter('category-${cat}')">${cat}</button>`
  ).join("");
  
  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all" onclick="setFilter('all')">Alle</button>
    <button class="filter-btn" data-filter="pending" onclick="setFilter('pending')">Ausstehend</button>
    <button class="filter-btn" data-filter="completed" onclick="setFilter('completed')">Erledigt</button>
    ${categoryButtons}
  `;
}

// Initialisierung
renderList();
updateCategoryFilters();

// Aktualisiert Kategorien wenn neue hinzugefügt werden
const observer = new MutationObserver(() => {
  updateCategoryFilters();
});
observer.observe(document.body, { childList: true, subtree: true });
