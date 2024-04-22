import React, { useState, useEffect } from "react";
import { useTasksContext } from "../Hook/useTasksContext";
import TaskDetails from "./TaskDetails";
import TaskForm from "./TaskForm";
import { useAuthContext } from "../Hook/useAuthContext";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const Home = () => {
  const { tasks, dispatch } = useTasksContext();
  const { user } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const tasksPerPage = 3; // Number of tasks per page

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user || !user.token) {
          console.error("User is not logged in or token is missing");
          return;
        }

        const response = await fetch("http://localhost:4000/api/tasks", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const json = await response.json();

        if (response.ok) {
          dispatch({ type: "SET_TASKS", payload: json });
        } else {
          console.error("Failed to fetch tasks:", json);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (user && user.token) {
      fetchTasks();
    }
  }, [dispatch, user]);

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.createdAt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.updatedAt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate the indexes of the tasks to be displayed on the current page
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Change page
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset page number when search term changes
  };

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Search tasks"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "200px",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        />
      </div>

      <div className="home">
        {currentTasks.length === 0 && <p>No task found.</p>}
        {currentTasks.length > 0 && (
          <div className="tasks">
            {currentTasks.map((task) => (
              <TaskDetails
                style={{ marginTop: "20px" }}
                task={task}
                key={task._id}
              />
            ))}
          </div>
        )}
        <TaskForm />
        <div className="pagination" style={{ marginTop: "-90px" }}>
          <Pagination
            count={Math.ceil(filteredTasks.length / tasksPerPage)} // Calculate total number of pages based on filtered tasks
            page={currentPage}
            onChange={handleChangePage}
            shape="rounded"
          />
        </div>
      </div>
    </>
  );
};

export default Home;
