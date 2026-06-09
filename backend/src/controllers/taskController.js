const taskRepository =
require('../repositories/taskRepository');

const taskAssignmentRepository =
require('../repositories/taskAssignmentRepository');

const taskService =
require('../services/taskService');

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

    res.status(201).json(task);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create task'
    });

  }

};

const getTasks = async (req, res) => {
  try {

    const tasks =
      await taskRepository.getAllTasks();

    res.status(200).json(tasks);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tasks'
    });

  }
};

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

    res.status(200).json(task);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update task'
    });

  }

};

//delete task
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

//assign task
const assignTask = async (req, res) => {

    try {

        const { taskId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'User ID is required'
            });
        }

        const assignment =
        await taskAssignmentRepository.assignTask(
            taskId,
            userId
        );

        return res.status(201).json({
            message: 'Task assigned successfully',
            assignment
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to assign task'
        });

    }
};

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