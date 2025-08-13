import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // this reads env file for all the variables

const app = express(); // this the main this what creates and starts the app

app.use(express.json()); // this line basice sends the data to the backend
app.use(cors());// this line allows the frontend to access the backend

// this is the main route for the backend
app.get("/", (req, res) => {
  res.send("Hello from backend");
});

const Port = process.env.PORT || 4000;

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
