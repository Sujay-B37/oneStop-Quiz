/**
 * Routes/resultRoutes.js
 * Description: Registers protected result-related endpoints.
 * Requires JWT verification via verifyToken middleware.
 */

const express = require("express");
const router = express.Router();

// Import controllers
const {
    submitQuiz,
    getResults
} = require("../Controllers/resultController");

// Import JWT verification middleware
const verifyToken = require("../Cognito Verification/verifyToken");

// POST /api/result/submit - Submits quiz answers, invokes Lambda to score, and stores the result (requires authentication)
router.post("/submit", verifyToken, submitQuiz);

// GET /api/result - Retrieves past quiz results of the authenticated user (requires authentication)
router.get("/", verifyToken, getResults);

module.exports = router;