const taskRepository =
require('../repositories/taskRepository');

const createTask = async (
  projectId,
  title,
  description,
  priority,
  dueDate,
  createdBy
) => {
  return await taskRepository.createTask(
    projectId,
    title,
    description,
    priority,
    dueDate,
    createdBy
  );
};

const getTasks = async () => {
  return await taskRepository.getAllTasks();
};

const getFilteredTasks = async (
  status,
  priority
) => {
  return await taskRepository.getFilteredTasks(
    status,
    priority
  );
};

module.exports = {
  createTask,
  getTasks,
  getFilteredTasks
};