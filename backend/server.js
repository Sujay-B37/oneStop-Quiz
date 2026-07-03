/**
 * server.js
 * Description: Main entry point for the Online Quiz Platform backend.
 * Configures Express middleware, routes, and global error handling.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Route Imports
const authRoutes = require("./Routes/authRoutes");
const quizRoutes = require("./Routes/quizRoutes");
const resultRoutes = require("./Routes/resultRoutes");

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Root Endpoint - Health Check
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Online Quiz Platform Backend is running 🚀"
    });
});

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/result", resultRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        status: "error",
        message: `Endpoint ${req.method} ${req.originalUrl} not found`
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal Server Error"
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});