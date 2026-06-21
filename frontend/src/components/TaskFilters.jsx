function TaskFilters({
  status,
  priority,
  setStatus,
  setPriority,
  onFilter
}) {

  return (

    <div className="filter-bar">

      <div className="filters">

        <input
          type="text"
          placeholder="🔍 Search tasks..."
          className="search-input"
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="">
            All Status
          </option>

          <option value="To Do">
            To Do
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

        </select>

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
        >
          <option value="">
            All Priorities
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>

        </select>

        <button onClick={onFilter}>
          Filter
        </button>

      </div>

    </div>

  );
}

export default TaskFilters;