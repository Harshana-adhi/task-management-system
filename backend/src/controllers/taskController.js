const taskRepository =
require('../repositories/taskRepository');

const taskAssignmentRepository =
require('../repositories/taskAssignmentRepository');

const taskService =
require('../services/taskService');

// Create Task
const createTask = async (req, res) => {

try {
const {
  projectId,
  title,
  description,
  priority,
  dueDate
} = req.body;

if (!projectId || !title || !priority) {
  return res.status(400).json({
    error: 'Validation Error',
    message: 'Project, title and priority are required'
  });
}

const task =
  await taskService.createTask(
    projectId,
    title,
    description,
    priority,
    dueDate,
    req.user.user_id
  );

return res.status(201).json(task);

} catch (error) {

console.error(error);

return res.status(500).json({
  error: 'Internal Server Error',
  message: 'Failed to create task'
});

}

};

// Get All Tasks
const getTasks = async (req, res) => {
  try {

    const tasks =
      await taskRepository.getAllTasks();

    return res.status(200).json(tasks);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tasks'
    });

  }
};

// Update Task
const updateTask = async (req, res) => {

try {

const { taskId } = req.params;

const {
  title,
  description,
  status,
  priority,
  dueDate
} = req.body;

const task =
  await taskRepository.updateTask(
    taskId,
    title,
    description,
    status,
    priority,
    dueDate
  );

return res.status(200).json(task);

} catch (error) {

  console.log("UPDATE ERROR");
  console.log(error);
  console.log(error.message);

  return res.status(500).json({
    error: "Internal Server Error",
    message: error.message
  });

}

};

// Delete Task
const deleteTask = async (req, res) => {

try {
const { taskId } = req.params;

const deletedTask =
  await taskRepository.deleteTask(taskId);

if (!deletedTask) {
  return res.status(404).json({
    error: 'Not Found',
    message: 'Task not found'
  });
}

return res.status(200).json({
  message: 'Task deleted successfully'
});

} catch (error) {

console.error(error);

return res.status(500).json({
  error: 'Internal Server Error',
  message: 'Failed to delete task'
});

}

};

// Assign Task
const assignTask = async (req, res) => {
  try {

    const { taskId } = req.params;
    const { userId } = req.body;

    console.log("Task ID:", taskId);
    console.log("User ID:", userId);

    if (!userId) {
      return res.status(400).json({
        error: "Validation Error",
        message: "User ID is required"
      });
    }

    console.log("ASSIGN BODY:");
console.log(req.body);

console.log("TASK ID:");
console.log(req.params.taskId);

    const assignment =
      await taskAssignmentRepository.assignTask(
        taskId,
        userId
      );

    console.log("Assignment Result:");
    console.log(assignment);

    return res.status(201).json({
      message: "Task assigned successfully",
      assignment
    });

  } catch (error) {

  console.log("========== ASSIGN ERROR ==========");
  console.log(error);
  console.log(error.message);

  return res.status(500).json({
    error: "Internal Server Error",
    message: error.message
  });

}
};

// Filter Tasks
const getFilteredTasks = async (req, res) => {
  try {

    const { status, priority } = req.query;

    const tasks =
      await taskService.getFilteredTasks(
        status,
        priority
      );

    return res.status(200).json(tasks);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to filter tasks'
    });

  }
};

module.exports = {
createTask,
getTasks,
updateTask,
deleteTask,
assignTask,
getFilteredTasks
};