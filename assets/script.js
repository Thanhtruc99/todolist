// Lấy các phần tử HTML cần thiết
const taskInput = document.getElementById('new-task');
const deadlineInput = document.getElementById('deadline');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const sortAscButton = document.getElementById('sort-asc');
const sortDescButton = document.getElementById('sort-desc');
const sortTimeAscButton = document.getElementById('sort-time-asc');
const sortTimeDescButton = document.getElementById('sort-time-desc');

// Lấy dữ liệu từ LocalStorage (nếu có)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Hiển thị danh sách công việc
function displayTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.classList.add('task');
    if (task.completed) li.classList.add('complete');

    const taskText = document.createElement('span');

    const createdText = new Date(task.timestamp).toLocaleString();

    let deadlineText = ' | Deadline: (none)';
    if (task.deadline) {
      // task.deadline lưu dạng "YYYY-MM-DD"
      const [y, m, d] = task.deadline.split('-');
      deadlineText = ` | Deadline: ${d}/${m}/${y}`;
    }

    taskText.textContent = `${task.text} - Created at: ${createdText}${deadlineText}`;
    taskText.addEventListener('click', () => toggleTaskCompletion(index));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(index));

    li.appendChild(taskText);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

// Thêm công việc mới
addTaskButton.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  tasks.push({
    text: taskText,
    completed: false,
    timestamp: Date.now(),
    // lưu deadline dạng "YYYY-MM-DD"
    deadline: deadlineInput.value ? deadlineInput.value : null
  });

  taskInput.value = '';
  deadlineInput.value = '';
  saveTasks();
  displayTasks();
});

// Lưu công việc vào LocalStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Đánh dấu công việc là hoàn thành
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  displayTasks();
}

// Xóa công việc
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  displayTasks();
}

// Sắp xếp công việc theo tên (tăng dần)
sortAscButton.addEventListener('click', () => {
  tasks.sort((a, b) => a.text.localeCompare(b.text));
  saveTasks();
  displayTasks();
});

// Sắp xếp công việc theo tên (giảm dần)
sortDescButton.addEventListener('click', () => {
  tasks.sort((a, b) => b.text.localeCompare(a.text));
  saveTasks();
  displayTasks();
});

// Sắp xếp công việc theo thời gian tạo (tăng dần)
sortTimeAscButton.addEventListener('click', () => {
  tasks.sort((a, b) => a.timestamp - b.timestamp);
  saveTasks();
  displayTasks();
});

// Sắp xếp công việc theo thời gian tạo (giảm dần)
sortTimeDescButton.addEventListener('click', () => {
  tasks.sort((a, b) => b.timestamp - a.timestamp);
  saveTasks();
  displayTasks();
});

// Hiển thị lại danh sách công việc khi tải lại trang
displayTasks();
