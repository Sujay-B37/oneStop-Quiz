/**
 * Routes/quizRoutes.js
 * Description: Registers protected quiz-related endpoints.
 * Requires JWT verification via verifyToken middleware.
 */

const express = require("express");
const router = express.Router();

// Import controllers
const {
    getAllQuizzes,
    getQuizById
} = require("../Controllers/quizController");

// Import JWT verification middleware
const verifyToken = require("../Cognito Verification/verifyToken");

// GET /api/quiz - Retrieves all available quizzes (requires authentication)
router.get("/", verifyToken, getAllQuizzes);

// GET /api/quiz/:id - Retrieves a specific quiz by ID (requires authentication)
router.get("/:id", verifyToken, getQuizById);

module.exports = router;