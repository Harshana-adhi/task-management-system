import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

const getAuthHeader = () => ({
  headers: {
    Authorization:
      `Bearer ${localStorage.getItem("token")}`
  }
});

// Get all tasks
export const getTasks = async () => {
  const response =
    await axios.get(
      API_URL,
      getAuthHeader()
    );

  return response.data;
};

// Create task
export const createTask = async (
  taskData
) => {

  const response =
    await axios.post(
      API_URL,
      taskData,
      getAuthHeader()
    );

  return response.data;
};

// Update task
export const updateTask = async (
  taskId,
  taskData
) => {

  const response =
    await axios.put(
      `${API_URL}/${taskId}`,
      taskData,
      getAuthHeader()
    );

  return response.data;
};

// Delete task
export const deleteTask = async (
  taskId
) => {

  const response =
    await axios.delete(
      `${API_URL}/${taskId}`,
      getAuthHeader()
    );

  return response.data;
};

// Assign task
export const assignTask = async (
  taskId,
  userId
) => {

  const response =
    await axios.post(
      `${API_URL}/${taskId}/assign`,
      { userId },
      getAuthHeader()
    );

  return response.data;
};

// Filter tasks
export const filterTasks = async (
  status,
  priority
) => {

  const response =
    await axios.get(
      `${API_URL}/filter?status=${status}&priority=${priority}`,
      getAuthHeader()
    );

  return response.data;
};