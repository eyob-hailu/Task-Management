import React, { useState } from "react";
import { useEffect } from "react";
import { useTasksContext } from "../Hook/useTasksContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { Link } from "react-router-dom";
import { useAuthContext } from "../Hook/useAuthContext";
import DeleteConfirmationModal from "./DeleteConfirmationModal"; // Import the modal component

const TaskDetails = ({ task }) => {
  const { dispatch } = useTasksContext();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user } = useAuthContext();
  const [showModal, setShowModal] = useState(false); // State to control the modal

  const handleClick = () => {
    if (!user) {
      return;
    }
    setShowModal(true); // Show the modal when delete button is clicked
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/tasks/" + task._id,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: "DELETE_TASK", payload: json });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setShowModal(false); // Hide the modal after deletion
    }
  };

  const handleStatusUpdate = async () => {
    if (task.status === "Pending") {
      await updateTaskStatus("In Progress", user.token);
    } else if (task.status === "In Progress") {
      await updateTaskStatus("Completed", user.token);
    }
  };

  const updateTaskStatus = async (newStatus, token) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/tasks/status/${task._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        dispatch({ type: "UPDATE_TASK_STATUS", payload: updatedTask });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Define button color based on task status
  let buttonColor = "";
  switch (task.status) {
    case "Pending":
      buttonColor = "red";
      break;
    case "In Progress":
      buttonColor = "blue";
      break;
    case "Completed":
      buttonColor = "green";
      break;
    default:
      buttonColor = "black";
  }

  return (
    <div className="task-details">
      <h4 style={{ color: "black" }}>
        <strong>Title:</strong> {task.title}
      </h4>
      <p>
        <strong>Description:</strong> {task.description}
      </p>
      <p>
        <strong>Created:</strong>{" "}
        {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
      </p>
      <p>
        <strong>Updated:</strong>{" "}
        {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
      </p>
      <p>
        {" "}
        <strong>
          Status:{" "}
          <button
            onClick={handleStatusUpdate}
            style={{ backgroundColor: buttonColor }}
          >
            {task.status}
          </button>
        </strong>
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Link
          to={`/edit/${task._id}`}
          className="material-symbols-outlined"
          style={{ textDecoration: "none" }}
        >
          edit
        </Link>
        <span
          onClick={handleClick}
          className="material-symbols-outlined"
          style={{
            cursor: "pointer",
            color: "black",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "red";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "";
          }}
        >
          delete
        </span>
      </div>

      {/* Render the modal component */}
      <DeleteConfirmationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TaskDetails;
