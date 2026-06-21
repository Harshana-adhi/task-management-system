function DashboardCards({ tasks }) {

  const totalTasks = tasks.length;

  const completed =
    tasks.filter(
      task => task.status === "Completed"
    ).length;

  const inProgress =
    tasks.filter(
      task => task.status === "In Progress"
    ).length;

  const overdue =
    tasks.filter(task =>
      new Date(task.due_date) < new Date() &&
      task.status !== "Completed"
    ).length;

  return (

    <div className="stats-grid">

      <div className="stat-card total-card">

        <div className="stat-icon total-icon">
          📋
        </div>

        <div className="stat-content">

          <p className="stat-title">
            TOTAL TASKS
          </p>

          <h2 className="stat-value">
            {totalTasks}
          </h2>

          <p className="stat-description">
            All tasks in the system
          </p>

        </div>

      </div>

      <div className="stat-card completed-card">

        <div className="stat-icon completed-icon">
          ✅
        </div>

        <div className="stat-content">

          <p className="stat-title">
            COMPLETED
          </p>

          <h2 className="stat-value">
            {completed}
          </h2>

          <p className="stat-description">
            Tasks completed
          </p>

        </div>

      </div>

      <div className="stat-card progress-card">

        <div className="stat-icon progress-icon">
          🔄
        </div>

        <div className="stat-content">

          <p className="stat-title">
            IN PROGRESS
          </p>

          <h2 className="stat-value">
            {inProgress}
          </h2>

          <p className="stat-description">
            Tasks in progress
          </p>

        </div>

      </div>

      <div className="stat-card overdue-card">

        <div className="stat-icon overdue-icon">
          ⚠️
        </div>

        <div className="stat-content">

          <p className="stat-title">
            OVERDUE
          </p>

          <h2 className="stat-value">
            {overdue}
          </h2>

          <p className="stat-description">
            Tasks past due date
          </p>

        </div>

      </div>

    </div>

  );
}

export default DashboardCards;