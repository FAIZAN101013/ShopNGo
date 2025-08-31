import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import productRouter from "./routes/productRoute.js";

dotenv.config(); // this reads env file for all the variables

connectDB(); // connect to MongoDB


const app = express(); // this the main this what creates and starts the app

app.use(express.json()); // this line basice sends the data to the backend
app.use(cors());// this line allows the frontend to access the backend

// Serve the product photos. The database stores paths like
// "/images/p_img1.webp", so this is what turns those into real files.
app.use("/images", express.static("public/images"));

app.use("/api/products", productRouter); // this line is the main route for the products

// this is the main route for the backend
app.get("/", (req, res) => {
  res.send("Hello from backend");
});

const Port = process.env.PORT || 4000;

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
