const express = require("express");
const authMiddleware = require("../authMiddleware");
const {
  createTask,
  getTasks,
  getTask,
  deleteTask,
  updateTask,
  updateTaskStatus
} = require("../controllers/TaskControllers");


const router = express.Router();
router.use(authMiddleware);
//get all workouts
router.get("/", getTasks);

//get single workout
router.get("/:id", getTask);

//post a new workout
router.post("/", createTask);

//delete a workout
router.delete("/:id", deleteTask);
//update a workout
router.patch("/:id", updateTask);
//update task tatus
router.patch("/status/:id", updateTaskStatus);

module.exports = router;
