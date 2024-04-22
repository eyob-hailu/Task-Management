import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTasksContext } from "../Hook/useTasksContext";
import { useAuthContext } from "../Hook/useAuthContext";
import { Modal, Button } from "@mui/material";
import ConfirmationDialog from "./ConfirmationDialog"; // Import the ConfirmationDialog component

const EditTask = () => {
  const { taskId } = useParams();
  const { dispatch } = useTasksContext();
  const { user } = useAuthContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to control the modal
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false); // State to control the confirmation dialog

  // Update emptyFields state whenever title or description changes
  useEffect(() => {
    const updatedEmptyFields = [];
    if (!title) {
      updatedEmptyFields.push("title");
    }
    if (!description) {
      updatedEmptyFields.push("description");
    }
    setEmptyFields(updatedEmptyFields);
  }, [title, description]);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/tasks/${taskId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setTitle(data.title);
          setDescription(data.description);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError(error.message);
      }
    };
    if (user) {
      fetchTaskDetails();
    }
  }, [taskId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in");
      return;
    }

    if (emptyFields.length > 0) {
      setError("Please fill in all fields");
      return;
    }

    // Show confirmation dialog before updating the task
    setShowConfirmationDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmationDialog(false); // Hide the confirmation dialog
    try {
      const response = await fetch(
        `http://localhost:4000/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setShowModal(true); // Show the success modal
        dispatch({ type: "UPDATE_Task", payload: data }); // Dispatch update action
        setError(null); // Reset error state
        setEmptyFields([]); // Clear empty fields
        window.location.href = "/";
      } else {
        // Handle error
        setError(data.error);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Error updating task");
    }
  };

  return (
    <div className="update-container">
      <div className="update">
        <h2>Update Task</h2>
        <form onSubmit={handleSubmit}>
          <label>Task Title:</label>
          <input
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            placeholder="Enter your task title"
            className={emptyFields.includes("title") ? "error" : ""}
          />

          <label>Task Description:</label>
          <textarea
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4} // specify the number of rows for the textarea
            cols={50} // specify the number of columns for the textarea
            placeholder="Enter your task description here..."
            className={emptyFields.includes("description") ? "error" : ""}
          />

          <button>Update Task</button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>

      {/* Confirmation dialog for updating the task */}
      <ConfirmationDialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        onConfirm={handleConfirmUpdate}
      />

      {/* Modal to confirm the update */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="update-task-modal"
        aria-describedby="modal-to-confirm-update"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            padding: 20,
            textAlign: "center",
          }}
        >
          <h2 id="update-task-modal">Update Confirmation</h2>
          <p id="modal-to-confirm-update">Task updated successfully!</p>
        </div>
      </Modal>
    </div>
  );
};

export default EditTask;
