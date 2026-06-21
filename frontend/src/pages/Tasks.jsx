import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import TaskTable from "../components/TaskTable";
import TaskFilters from "../components/TaskFilters";
import TaskForm from "../components/TaskForm";
import AssignTaskModal from "../components/AssignTaskModal";
import DeleteTaskModal from "../components/DeleteTaskModal";
import DashboardCards from "../components/DashboardCards";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  filterTasks
} from "../services/taskService";

import "../styles/Tasks.css";

function Tasks() {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: ""
  });

  /* =========================
     LOAD TASKS
  ========================= */

  const loadTasks = async () => {

    try {

      setLoading(true);

      const data = await getTasks();

      setTasks(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadTasks();

  }, []);

  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {

    setShowForm(false);
    setIsEditing(false);
    setSelectedTask(null);

    setFormData({
      projectId: "",
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: ""
    });

  };

  /* =========================
     CREATE / UPDATE
  ========================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      if (isEditing) {

        await updateTask(
          selectedTask.task_id,
          {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            dueDate: formData.dueDate
          }
        );

      } else {

        await createTask({
          projectId: formData.projectId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate
        });

      }

      resetForm();

      await loadTasks();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to save task"
      );

    }

  };

  /* =========================
     EDIT TASK
  ========================= */

  const handleEdit = (task) => {

    setSelectedTask(task);

    setIsEditing(true);

    setFormData({
      projectId: task.project_id || "",
      title: task.title || "",
      description: task.description || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      dueDate:
        task.due_date
          ? task.due_date.split("T")[0]
          : ""
    });

    setShowForm(true);

  };

  /* =========================
     ASSIGN TASK
  ========================= */

  const handleAssign = async (
    taskId,
    userId
  ) => {

    try {

      await assignTask(
        taskId,
        userId
      );

      setShowAssignModal(false);
      setSelectedTask(null);

      await loadTasks();

      alert(
        "Task assigned successfully"
      );

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to assign task"
      );

    }

  };

  /* =========================
     DELETE TASK
  ========================= */

  const handleDelete = async (
    taskId
  ) => {

    try {

      await deleteTask(taskId);

      setShowDeleteModal(false);
      setSelectedTask(null);

      await loadTasks();

      alert(
        "Task deleted successfully"
      );

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete task"
      );

    }

  };

  /* =========================
     FILTER TASKS
  ========================= */

  const handleFilter = async () => {

    try {

      const data =
        await filterTasks(
          status,
          priority
        );

      setTasks(data);

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <div className="tasks-layout">

      <Sidebar />

      <div className="tasks-content">

        {/* HEADER */}

        <div className="tasks-header">

          <div className="tasks-header-left">

            <h1>Task Management</h1>

              <p className="page-subtitle">
              Manage projects and team tasks
              </p>

          </div>

          <div className="header-actions">

            <button
              className="refresh-btn"
              onClick={loadTasks}
            >
              Refresh
            </button>

            <button
              className="create-btn"
              onClick={() =>
                setShowForm(true)
              }
            >
              + Create Task
            </button>

          </div>

        </div>

        {/* DASHBOARD CARDS */}

        <DashboardCards
          tasks={tasks}
        />

        {/* FILTERS */}

        <TaskFilters
          status={status}
          priority={priority}
          setStatus={setStatus}
          setPriority={setPriority}
          onFilter={handleFilter}
        />

        {/* TABLE */}

        {
          loading
            ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center"
                }}
              >
                Loading Tasks...
              </div>
            )
            : (
              <TaskTable
                tasks={tasks}
                onEdit={handleEdit}
                onAssign={(task) => {

                  setSelectedTask(task);

                  setShowAssignModal(true);

                }}
                onDelete={(taskId) => {

                  const task =
                    tasks.find(
                      (t) =>
                        t.task_id === taskId
                    );

                  setSelectedTask(task);

                  setShowDeleteModal(true);

                }}
              />
            )
        }

      </div>

      {/* CREATE / UPDATE MODAL */}

      <TaskForm
        isOpen={showForm}
        onClose={resetForm}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
      />

      {/* ASSIGN MODAL */}

      {
        selectedTask && (

          <AssignTaskModal
            isOpen={showAssignModal}
            onClose={() => {

              setShowAssignModal(false);
              setSelectedTask(null);

            }}
            onAssign={handleAssign}
            task={selectedTask}
          />

        )
      }

      {/* DELETE MODAL */}

      {
        selectedTask && (

          <DeleteTaskModal
            isOpen={showDeleteModal}
            onClose={() => {

              setShowDeleteModal(false);
              setSelectedTask(null);

            }}
            onDelete={handleDelete}
            task={selectedTask}
          />

        )
      }

    </div>

  );

}

export default Tasks;