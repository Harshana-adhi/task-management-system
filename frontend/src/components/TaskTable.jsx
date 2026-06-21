// src/components/TaskTable.jsx

function TaskTable({
  tasks,
  onEdit,
  onAssign,
  onDelete
}) {

  const getStatusClass = (status) => {

    switch (status) {

      case "To Do":
        return "status-badge status-todo";

      case "In Progress":
        return "status-badge status-progress";

      case "Completed":
        return "status-badge status-completed";

      default:
        return "status-badge";
    }
  };

  const getPriorityClass = (priority) => {

    switch (priority?.toLowerCase()) {

      case "high":
        return "priority-high";

      case "medium":
        return "priority-medium";

      case "low":
        return "priority-low";

      default:
        return "";
    }
  };

  const isOverdue = (dueDate) => {

    if (!dueDate) return false;

    const today = new Date();
    const taskDate = new Date(dueDate);

    return (
      taskDate < today
    );
  };

  if (!tasks || tasks.length === 0) {

    return (

      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.05)"
        }}
      >
        <h3>No Tasks Found</h3>
        <p>
          Create a task to get started.
        </p>
      </div>

    );
  }

  return (

    <div className="table-wrapper">

      <table className="task-table">

        <thead>

          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>

        </thead>

        <tbody>

          {tasks.map((task) => (

            <tr key={task.task_id}>

              <td>
                <strong>
                  {task.title}
                </strong>
              </td>

              <td>
                {task.description}
              </td>

              <td>
  <span className="assignee-badge">
    {task.assigned_user ||
      "Unassigned"}
  </span>
</td>


              <td>

                <span
                  className={
                    getStatusClass(
                      task.status
                    )
                  }
                >
                  {task.status}
                </span>

              </td>

              <td>

                <span
                  className={
                    getPriorityClass(
                      task.priority
                    )
                  }
                >
                  {task.priority}
                </span>

              </td>

              <td>

                <span
                  className={
                    isOverdue(
                      task.due_date
                    )
                      ? "overdue-date"
                      : ""
                  }
                >

                  {task.due_date
                    ? new Date(
                        task.due_date
                      ).toLocaleDateString()
                    : "N/A"}

                </span>

              </td>

              <td>

                <div className="action-group">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      onEdit(task)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="assign-btn"
                    onClick={() =>
                      onAssign(task)
                    }
                  >
                    Assign
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      onDelete(
                        task.task_id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}

export default TaskTable;