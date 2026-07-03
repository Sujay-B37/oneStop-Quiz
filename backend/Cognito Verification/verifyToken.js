/**
 * Cognito Verification/verifyToken.js (MOCK IMPLEMENTATION)
 * Description: Express middleware that validates local JWT tokens instead of AWS Cognito tokens.
 * Decodes the JWT using standard jsonwebtoken and attaches mock user context to the request.
 */

const jwt = require("jsonwebtoken");

// Use standard local secret (matches cognitoService.js secret)
const MOCK_JWT_SECRET = process.env.JWT_SECRET || "local-super-secret-key";

/**
 * Middleware function to verify the Authorization Bearer Token locally.
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.match(/^Bearer\s+/i)) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized access: Missing or invalid token format. Expected 'Bearer <JWT_TOKEN>'"
            });
        }

        // Robust extraction: remove "Bearer" (case-insensitive) and all subsequent whitespace
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();

        console.log(`[MOCK VERIFICATION] Verifying token of length: ${token.length}`);

        // Verify local token
        const payload = jwt.verify(token, MOCK_JWT_SECRET);

        // Attach claims to request context to simulate Cognito User context
        req.user = {
            userId: payload.sub, // Simulated Cognito sub
            email: payload.email,
            username: payload.preferred_username || "anonymous"
        };

        next();
    } catch (error) {
        console.error("[MOCK VERIFICATION] Token validation failed:", error.message || error);
        return res.status(401).json({
            status: "error",
            message: "Unauthorized access: Invalid or expired token.",
            details: error.message
        });
    }
};

module.exports = verifyToken;
