import { useEffect } from "react";
import "../styles/Modal.css";

function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing
}) {

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  if (!isOpen) return null;

  return (

    <div className="modal-overlay">

      <div className="modal-container task-modal">

        <div className="modal-header">

          <h2>
            {isEditing
              ? "Update Task"
              : "Create Task"}
          </h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <form
          className="task-form"
          onSubmit={onSubmit}
        >

{/* Row 1 */}

<div
  className={
    !isEditing
      ? "form-row"
      : "form-row single-column"
  }
>

  {
    !isEditing && (

      <div className="form-group">

        <label>
          Project ID
        </label>

        <input
          type="text"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          placeholder="Enter Project ID"
          required
        />

      </div>

    )
  }

  <div className="form-group">

    <label>
      Title
    </label>

    <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="Task Title"
      required
    />

  </div>

</div>

          {/* Description */}

          <div className="form-group full-width">

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Task Description"
            />

          </div>

          {/* Status Only During Edit */}

          {
            isEditing && (

              <div className="form-group full-width">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
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

              </div>

            )
          }

          {/* Row 2 */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
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

            </div>

            <div className="form-group">

              <label>
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* Buttons */}

          <div className="modal-actions">

            <button
              type="submit"
              className="save-btn"
            >
              {
                isEditing
                  ? "Update Task"
                  : "Create Task"
              }
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default TaskForm;