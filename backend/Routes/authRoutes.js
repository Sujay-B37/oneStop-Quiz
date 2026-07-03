/**
 * Routes/authRoutes.js
 * Description: Registers public authentication endpoints for sign-up and login.
 * Delegates business logic to the authController.
 */

const express = require("express");
const router = express.Router();

// Import controllers
const {
    signup,
    login
} = require("../Controllers/authController");

// POST /api/auth/signup - Registers a new user with Cognito
router.post("/signup", signup);

// POST /api/auth/login - Authenticates user and returns JWT
router.post("/login", login);

module.exports = router;