// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  const id = nextId;
  nextId++;
  saveNextId(nextId); // Save incremented nextId back to localStorage
  return id;
}

// Function to save nextId to localStorage
function saveNextId(nextId) {
  localStorage.setItem("nextId", nextId);
}

// Function to create a task card
function createTaskCard(task) {
  const card = $(`
    <div id="task-${task.id}" class="task-card card mb-3" data-task-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><strong>Deadline:</strong> ${task.deadline}</p>
        <button class="btn btn-danger btn-sm delete-task"><i class="fas fa-trash-alt"></i> Delete</button>
      </div>
    </div>
  `);

  // Make the task card draggable
  card.draggable({
    revert: "invalid",
    cursor: "grab",
    opacity: 0.7,
    zIndex: 1000,
    start: function() {
      $(this).addClass("dragging");
    },
    stop: function() {
      $(this).removeClass("dragging");
    }
  });

  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    if (task.status === "todo") {
      $("#todo-cards").append(card);
    } else if (task.status === "in-progress") {
      $("#in-progress-cards").append(card);
    } else if (task.status === "done") {
      $("#done-cards").append(card);
    }
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  
  const title = $("#task-title").val();
  const description = $("#task-description").val();
  const deadline = $("#task-deadline").val();
  
  const newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    deadline: deadline,
    status: "todo" // Default status
  };

  taskList.push(newTask);
  saveTasks();
  renderTaskList();
  $("#formModal").modal("hide");
  $("#task-form")[0].reset(); // Reset form after submission
}

// Function to handle deleting a task
function handleDeleteTask(taskId) {
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasks();
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("task-id");
  const newStatus = event.target.id;
  
  const taskIndex = taskList.findIndex(task => task.id === taskId);
  if (taskIndex > -1) {
    taskList[taskIndex].status = newStatus;
    saveTasks();
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

// Initialize the page
$(document).ready(function() {
  renderTaskList();

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Initialize date picker
  $("#task-deadline").datepicker({
    dateFormat: "yy-mm-dd"
  });

  // Update event handler for delete task
  $(document).on("click", ".delete-task", function() {
    const taskId = $(this).closest(".task-card").data("task-id");
    handleDeleteTask(taskId);
  });

  // Handle form submission
  $("#task-form").submit(handleAddTask);
});
