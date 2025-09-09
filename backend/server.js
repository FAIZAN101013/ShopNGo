// Loaded first, and as an import rather than a call, because imports are all
// evaluated before any line of this file runs. dotenv.config() further down
// would happen after the routes below had already read process.env.
import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { verifyMailer } from "./config/mailer.js";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";

connectDB(); // connect to MongoDB
verifyMailer(); // check the SMTP login now, not at the first signup

const app = express(); // this the main this what creates and starts the app

app.use(express.json()); // this line basice sends the data to the backend

/*
  Which websites are allowed to call this API.

  app.use(cors()) let ANY page on the internet call it, which was fine while
  the only caller was localhost. In production it means someone else's site
  can put up a copy of the shop running on my database and my email quota.

  ALLOWED_ORIGINS is a comma separated list. Left empty it falls back to
  allowing everything, so a fresh clone still works with no config.
*/
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header at all: curl, uptime pings, and the <img> tags
      // asking for product photos. There is no browser to protect here.
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Answer without the CORS headers rather than throwing. Throwing would
      // land in the error handler below and return a 500, which says "we are
      // broken" when the truth is "you are not on the list".
      console.warn(`CORS: refused ${origin}`);
      callback(null, false);
    },
  })
);

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

/*
  Is this thing on?

  Two jobs. Render pings it to decide whether a deploy actually came up, and
  it answers honestly about MongoDB - a server that is running but cannot
  reach its database is not healthy, and saying "ok" there would hide the
  real problem.

  It is also the URL to point an uptime pinger at, since a free Render
  service falls asleep after 15 minutes of silence.
*/
app.get("/health", (req, res) => {
  // 1 is connected. Anything else means the database is not there.
  const dbUp = mongoose.connection.readyState === 1;

  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    database: dbUp ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
  });
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
