import { useState } from "react";
import { useTasksContext } from "../Hook/useTasksContext";
import { useAuthContext } from "../Hook/useAuthContext";

const TaskForm = () => {
  const { dispatch } = useTasksContext();
  const { user } = useAuthContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    const task = { title, description };

    const response = await fetch("http://localhost:4000/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      setEmptyFields(json.emptyFields);
    }
    if (response.ok) {
      setEmptyFields([]);
      setError(null);
      setTitle("");
      setDescription("");
      dispatch({ type: "CREATE_TASK", payload: json });
    }
  };

  return (
    <div className="form-container">
      <form className="create" onSubmit={handleSubmit}>
        <h3>Add a New Task</h3>

        <label>Task Title:</label>
        <input
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder="Enter your task title"
          className={
            emptyFields && emptyFields.includes("title") ? "error" : ""
          }
        />

        <label>Task Description:</label>
        <textarea
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          cols={50}
          placeholder="Enter your task description here..."
          className={
            emptyFields && emptyFields.includes("description") ? "error" : ""
          }
        />

        <button>Add Task</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default TaskForm;
