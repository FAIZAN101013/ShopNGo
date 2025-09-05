// Loaded first, and as an import rather than a call, because imports are all
// evaluated before any line of this file runs. dotenv.config() further down
// would happen after the routes below had already read process.env.
import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import { verifyMailer } from "./config/mailer.js";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";

connectDB(); // connect to MongoDB
verifyMailer(); // check the SMTP login now, not at the first signup

const app = express(); // this the main this what creates and starts the app

app.use(express.json()); // this line basice sends the data to the backend
app.use(cors());// this line allows the frontend to access the backend

// Serve the product photos. The database stores paths like
// "/images/p_img1.webp", so this is what turns those into real files.
app.use("/images", express.static("public/images"));

app.use("/api/products", productRouter); // this line is the main route for the products
app.use("/api/user", userRouter); // accounts: register, verify, login, password reset
app.use("/api/orders", orderRouter); // placing and reading your own orders

// this is the main route for the backend
app.get("/", (req, res) => {
  res.send("Hello from backend");
});

// A wrong API path used to fall through to Express's HTML error page, and
// the frontend would then fail trying to read JSON out of it. Answer in the
// same shape as every other route instead.
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: `No such endpoint: ${req.method} ${req.originalUrl}` });
});

// The last safety net. Anything thrown that a controller did not catch lands
// here, so the server logs the real reason and the browser gets one sentence
// rather than a stack trace.
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ success: false, message: "Something went wrong on our end" });
});

const Port = process.env.PORT || 4000;

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
