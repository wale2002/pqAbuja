require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const attemptRoutes = require("./routes/attemptRoutes");

const AppError = require("./utils/AppError");
const documentRoutes = require("./routes/documentRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Connect to MongoDB
connectDB();
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://fifthlab-collaboration.onrender.com",
  "http://localhost:3000",
  "http://localhost:3000/",
  "http://localhost:8081/",
  "https://pastwise-solver.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new AppError(`CORS policy: Origin ${origin} not allowed`, 403));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
// Routes
app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
// Health check
// app.get("/api/health", (req, res) => {
//   res.status(200).json({ message: "Server is running" });
// });

// Error-handling middleware
// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on the port ${PORT}`));
