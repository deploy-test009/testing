require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Configuration
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl && frontendUrl.trim() !== "" && frontendUrl.trim() !== "*") {
  const allowedOrigins = frontendUrl
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""));

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, "");
        if (
          allowedOrigins.includes(cleanOrigin) ||
          (process.env.NODE_ENV !== "production" &&
            (/^http:\/\/localhost(:\d+)?$/.test(cleanOrigin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(cleanOrigin)))
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
    })
  );
} else {
  app.use(cors());
}

// Optional MongoDB Connection
const hasValidMongoUri =
  Boolean(process.env.MONGO_URI) &&
  process.env.MONGO_URI.trim() !== "" &&
  !process.env.MONGO_URI.includes("<username>") &&
  !process.env.MONGO_URI.includes("<db_username>");

if (hasValidMongoUri) {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
} else {
  if (
    process.env.MONGO_URI &&
    (process.env.MONGO_URI.includes("<username>") || process.env.MONGO_URI.includes("<db_username>"))
  ) {
    console.log("MONGO_URI contains placeholder credentials (<username>/<db_username>). Skipping database connection.");
  } else {
    console.log("MONGO_URI not set. Skipping database connection.");
  }
}

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from the backend",
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/api/db-status", (req, res) => {
  if (!process.env.MONGO_URI) {
    return res.json({
      connected: false,
      reason: "MONGO_URI not set",
    });
  }

  if (process.env.MONGO_URI.includes("<username>") || process.env.MONGO_URI.includes("<db_username>")) {
    return res.json({
      connected: false,
      reason: "MONGO_URI contains placeholder credentials (<db_username>). Replace with actual database username.",
    });
  }

  const isConnected = mongoose.connection.readyState === 1;
  return res.json({
    connected: isConnected,
    ...(!isConnected ? { reason: `Mongoose connection state: ${mongoose.connection.readyState}` } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

