const Task = require("../models/TaskModel");
const mongoose = require("mongoose");

//get all workout
const getTasks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const user_id = req.user._id;
    const tasks = await Task.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
//get a single workout
const getTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No Such Task" }); //checking id validity
  }
  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ error: "No such Task" });
  }
  res.status(200).json(task);
};

//create  new workout
const createTask = async (req, res) => {
  const { title, description, status } = req.body;

  let emptyFields = [];

  if (!title) {
    emptyFields.push("title");
  }
  if (!description) {
    emptyFields.push("description");
  }

  // Set default value for status if not provided
  const taskStatus = status || "Pending";

  try {
    if (emptyFields.length > 0) {
      return res
        .status(400)
        .json({ error: "Please fill in all fields", emptyFields });
    }
    const user_id = req.user._id;
    // Add document to the database with default status
    const task = await Task.create({
      title,
      description,
      status: taskStatus,
      user_id,
    });

    // Set response headers and send response
    res.setHeader("Some-Header", "value");
    res.status(200).json(task);
  } catch (error) {
    // Handle errors
    res.status(400).json({ error: error.message });
  }
};

//delete a workout
const deleteTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No Such Task" });
  }
  const task = await Task.findOneAndDelete({ _id: id });
  if (!task) {
    return res.status(400).json({ error: "No such Task" });
  }
  res.status(200).json(task);
};

//update a workout

// update a workout
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body; // Destructure title, load, reps from req.body

  let emptyFields = [];

  if (!title) {
    emptyFields.push("title");
  }
  if (!description) {
    emptyFields.push("description");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all fields", emptyFields });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No Such Task" });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { title, description }, // Pass updated fields to be modified
      { new: true } // Set new to true to return the modified document
    );

    if (!task) {
      return res.status(404).json({ error: "No such Task" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No Such Task" });
  }

  try {
    let task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "No such Task" });
    }

    if (task.status === "Completed") {
      return res.status(400).json({ error: "Task is already completed" });
    }

    if (task.status === "Pending") {
      task.status = "In Progress";
    } else if (task.status === "In Progress") {
      task.status = "Completed";
    }

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
};