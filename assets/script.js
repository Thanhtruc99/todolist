// Lấy các phần tử HTML cần thiết
const taskInput = document.getElementById('new-task');
const deadlineInput = document.getElementById('deadline');
const priorityInput = document.getElementById('priority');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

const sortAscButton = document.getElementById('sort-asc');
const sortDescButton = document.getElementById('sort-desc');
const sortTimeAscButton = document.getElementById('sort-time-asc');
const sortTimeDescButton = document.getElementById('sort-time-desc');

// Filter buttons
const filterAllBtn = document.getElementById('filter-all');
const filterTodayBtn = document.getElementById('filter-today');
const filterUpcomingBtn = document.getElementById('filter-upcoming');
const filterOverdueBtn = document.getElementById('filter-overdue');
const filterNoneBtn = document.getElementById('filter-none');

// Lấy dữ liệu từ LocalStorage (nếu có)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// trạng thái filter
let currentFilter = 'all';

/* ========= FORMAT: đồng bộ ngày tháng =========
   - Created at: DD/MM/YYYY HH:mm
   - Deadline:   DD/MM/YYYY
*/
function formatDateTime(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${min}`;
}

function formatDateOnly(ymd) {
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}

// ===== Helpers về ngày tháng (deadline lưu "YYYY-MM-DD") =====
function parseYMDToDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isOverdue(task) {
  if (!task.deadline) return false;
  if (task.completed) return false; // nếu muốn completed vẫn đỏ -> xóa dòng này
  const dl = parseYMDToDate(task.deadline);
  return dl < startOfToday();
}

function isToday(task) {
  if (!task.deadline) return false;
  const dl = parseYMDToDate(task.deadline);
  const t = startOfToday();
  return dl.getTime() === t.getTime();
}

function isUpcoming7Days(task) {
  if (!task.deadline) return false;
  const dl = parseYMDToDate(task.deadline);
  const t = startOfToday();
  const end = new Date(t);
  end.setDate(end.getDate() + 7);
  return dl >= t && dl <= end;
}

function setActiveFilterButton(activeBtn) {
  [filterAllBtn, filterTodayBtn, filterUpcomingBtn, filterOverdueBtn, filterNoneBtn]
    .forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
}

function priorityLabel(p) {
  if (p === 'high') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium';
}

// ===== Hiển thị danh sách công việc =====
function displayTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    switch (currentFilter) {
      case 'today':
        return isToday(task);
      case 'upcoming':
        return isUpcoming7Days(task);
      case 'overdue':
        return isOverdue(task);
      case 'none':
        return !task.deadline;
      case 'all':
      default:
        return true;
    }
  });

  filteredTasks.forEach((task) => {
    const realIndex = tasks.indexOf(task);

    const li = document.createElement('li');
    li.classList.add('task');
    if (task.completed) li.classList.add('complete');
    if (isOverdue(task)) li.classList.add('overdue');

    const left = document.createElement('span');
    left.style.flex = '1';

    const createdText = formatDateTime(task.timestamp);
    const deadlineText = task.deadline ? formatDateOnly(task.deadline) : '(none)';
    const p = task.priority || 'medium';

    // text chính
    const textNode = document.createElement('span');
    textNode.textContent = `${task.text} - Created at: ${createdText} | Deadline: ${deadlineText}`;
    textNode.addEventListener('click', () => toggleTaskCompletion(realIndex));

    // badge priority
    const badge = document.createElement('span');
    badge.classList.add('badge', p);
    badge.textContent = `Priority: ${priorityLabel(p)}`;

    left.appendChild(textNode);
    left.appendChild(badge);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(realIndex));

    li.appendChild(left);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

// ===== Thêm công việc mới =====
addTaskButton.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  tasks.push({
    text: taskText,
    completed: false,
    timestamp: Date.now(),
    deadline: deadlineInput.value ? deadlineInput.value : null, // "YYYY-MM-DD"
    priority: priorityInput ? priorityInput.value : 'medium'     // ✅ priority
  });

  taskInput.value = '';
  deadlineInput.value = '';
  if (priorityInput) priorityInput.value = 'medium';
  saveTasks();
  displayTasks();
});

// ===== Lưu công việc vào LocalStorage =====
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== Đánh dấu công việc là hoàn thành =====
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  displayTasks();
}

// ===== Xóa công việc =====
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  displayTasks();
}

// ===== Sort =====
sortAscButton.addEventListener('click', () => {
  tasks.sort((a, b) => a.text.localeCompare(b.text));
  saveTasks();
  displayTasks();
});

sortDescButton.addEventListener('click', () => {
  tasks.sort((a, b) => b.text.localeCompare(a.text));
  saveTasks();
  displayTasks();
});

sortTimeAscButton.addEventListener('click', () => {
  tasks.sort((a, b) => a.timestamp - b.timestamp);
  saveTasks();
  displayTasks();
});

sortTimeDescButton.addEventListener('click', () => {
  tasks.sort((a, b) => b.timestamp - a.timestamp);
  saveTasks();
  displayTasks();
});

// ===== Filters =====
filterAllBtn.addEventListener('click', () => {
  currentFilter = 'all';
  setActiveFilterButton(filterAllBtn);
  displayTasks();
});

filterTodayBtn.addEventListener('click', () => {
  currentFilter = 'today';
  setActiveFilterButton(filterTodayBtn);
  displayTasks();
});

filterUpcomingBtn.addEventListener('click', () => {
  currentFilter = 'upcoming';
  setActiveFilterButton(filterUpcomingBtn);
  displayTasks();
});

filterOverdueBtn.addEventListener('click', () => {
  currentFilter = 'overdue';
  setActiveFilterButton(filterOverdueBtn);
  displayTasks();
});

filterNoneBtn.addEventListener('click', () => {
  currentFilter = 'none';
  setActiveFilterButton(filterNoneBtn);
  displayTasks();
});

// Hiển thị lại danh sách công việc khi tải lại trang
displayTasks();
