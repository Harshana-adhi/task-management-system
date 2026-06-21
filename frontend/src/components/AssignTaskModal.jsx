import { useState } from "react";
import "../styles/Modal.css";

function AssignTaskModal({
  isOpen,
  onClose,
  onAssign,
  task
}) {

  const [userId,
    setUserId] =
    useState("");

  if (!isOpen) return null;

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    await onAssign(
      task.task_id,
      userId
    );

    setUserId("");
  };

  return (

    <div className="modal-overlay">

      <div className="modal-container assign-modal">

        <div className="modal-header">

          <h2>
            Assign Task
          </h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="task-form"
        >

          <div className="form-group">

            <label>
              Task
            </label>

            <input
              type="text"
              value={task.title}
              disabled
            />

          </div>

          <div className="form-group">

            <label>
              User ID
            </label>

            <input
              type="text"
              value={userId}
              onChange={(e) =>
                setUserId(
                  e.target.value
                )
              }
              placeholder="Enter User ID"
              required
            />

          </div>

          <div className="modal-actions">

            <button
              type="submit"
              className="save-btn"
            >
              Assign Task
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

export default AssignTaskModal;