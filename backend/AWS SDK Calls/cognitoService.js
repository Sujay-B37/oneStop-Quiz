/**
 * AWS SDK Calls/cognitoService.js (MOCK IMPLEMENTATION)
 * Description: Mimics AWS Cognito behaviors using in-memory arrays and jsonwebtoken.
 * Generates local JWTs and errors to match AWS Cognito Service characteristics.
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Local secret key for signing mock JWTs
const MOCK_JWT_SECRET = process.env.JWT_SECRET || "local-super-secret-key";

// In-memory Cognito Database
const mockCognitoUsers = [];

/**
 * Register a user in mock Cognito.
 * @param {string} username - Chosen username.
 * @param {string} email - User email address.
 * @param {string} password - User password.
 * @returns {Promise<object>} User Sub ID and status.
 */
const signUpUser = async (username, email, password) => {
    // Mimic network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if user already exists
    const userExists = mockCognitoUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
        const error = new Error("User already exists.");
        error.name = "UsernameExistsException";
        throw error;
    }

    // Validate simple password requirement
    if (password.length < 6) {
        const error = new Error("Password must be at least 6 characters.");
        error.name = "InvalidPasswordException";
        throw error;
    }

    // Generate Cognito Sub ID (UUID)
    const userSub = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    
    const newUser = {
        userSub,
        username,
        email,
        password // Storing in plain-text for mock simplicity
    };
    
    mockCognitoUsers.push(newUser);
    console.log(`[MOCK COGNITO] Signed up new user: ${email} (Sub: ${userSub})`);
    
    return {
        userSub,
        userConfirmed: true
    };
};

/**
 * Authenticate a user in mock Cognito and return signed JWTs.
 * @param {string} email - Registered email.
 * @param {string} password - User password.
 * @returns {Promise<object>} Object matching Cognito's AuthenticationResult.
 */
const signInUser = async (email, password) => {
    // Mimic network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find the user record
    const user = mockCognitoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        const error = new Error("User does not exist.");
        error.name = "UserNotFoundException";
        throw error;
    }

    // Check credentials
    if (user.password !== password) {
        const error = new Error("Incorrect password.");
        error.name = "NotAuthorizedException";
        throw error;
    }

    // Construct JWT claims matching a standard Cognito ID Token payload
    const jwtPayload = {
        sub: user.userSub,
        email: user.email,
        preferred_username: user.username,
        iss: "mock-cognito-identity-provider",
        aud: "mock-client-id",
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };

    // Sign the mock ID token using jsonwebtoken
    const idToken = jwt.sign(jwtPayload, MOCK_JWT_SECRET);
    
    console.log(`[MOCK COGNITO] Authenticated user: ${email}`);

    return {
        AccessToken: "mock-access-token-string",
        IdToken: idToken,
        RefreshToken: "mock-refresh-token-string",
        ExpiresIn: 3600
    };
};

// Export the internal memory store for verification purposes (or other mock services)
module.exports = {
    signUpUser,
    signInUser,
    _mockCognitoUsers: mockCognitoUsers // Internal export for local linking if needed
};
