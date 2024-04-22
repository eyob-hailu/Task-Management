require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const TaskRoute = require("./routes/TaskRoutes");
const userRoutes = require('./routes/userRoutes')
const cors = require("cors");

//express app
const app = express();

app.use(cors());

//moddleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//routes
app.use("/api/tasks", TaskRoute);
app.use('/api/user', userRoutes)
//connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });

//listen for requests
