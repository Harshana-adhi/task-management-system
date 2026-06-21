import "../styles/Modal.css";

function DeleteTaskModal({
  isOpen,
  onClose,
  onDelete,
  task
}) {

  if (!isOpen) return null;

  return (

    <div className="modal-overlay">

      <div className="modal-container delete-modal">

        <h2>
          Delete Task
        </h2>

        <p>

          Are you sure you want
          to delete

          <strong>
            {" "}
            {task.title}
          </strong>

          ?

        </p>

        <div className="modal-actions">

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

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  );
}

export default DeleteTaskModal;