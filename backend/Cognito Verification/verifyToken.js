/**
 * Cognito Verification/verifyToken.js
 * Description: Express middleware that intercepts incoming protected HTTP requests.
 * Extracts the JWT token from the Authorization header, verifies it with Cognito using aws-jwt-verify,
 * and attaches the decoded user payload to the request object.
 * 
 * Note: Instantiation is lazy-loaded to prevent Node server crashes during startup
 * if Cognito configuration is missing in the environment.
 * Custom responseTimeout is set to 10 seconds to accommodate slower local networks.
 */

const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { SimpleJwksCache } = require("aws-jwt-verify/jwk");
const { SimpleJsonFetcher } = require("aws-jwt-verify/https");

let verifierInstance = null;

/**
 * Lazy helper to retrieve the Cognito JWT Verifier instance.
 * Instantiates the verifier on first request to prevent crashes on startup.
 */
const getVerifier = () => {
    if (!verifierInstance) {
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const clientId = process.env.COGNITO_CLIENT_ID;

        if (!userPoolId || !clientId) {
            throw new Error("Cognito Configuration Error: COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set in environment variables.");
        }

        // Initialize verifier instance with custom 10-second response timeout
        verifierInstance = CognitoJwtVerifier.create(
            {
                userPoolId: userPoolId,
                clientId: clientId,
                tokenUse: "id" // Verifies Cognito ID token
            },
            {
                jwksCache: new SimpleJwksCache({
                    fetcher: new SimpleJsonFetcher({
                        defaultRequestOptions: {
                            responseTimeout: 10000 // 10 seconds timeout
                        }
                    })
                })
            }
        );
    }
    return verifierInstance;
};

/**
 * Middleware function to verify the Authorization Bearer Token.
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

        // Retrieve verifier (initializes if first run, throws if unconfigured)
        const verifier = getVerifier();

        // Verify token with Cognito pool
        const payload = await verifier.verify(token);

        // Attach Cognito claims to standard req.user context
        req.user = {
            userId: payload.sub, // Cognito User ID (sub)
            email: payload.email,
            username: payload["cognito:username"] || payload.preferred_username || payload.username || "anonymous"
        };

        next();
    } catch (error) {
        console.error("[COGNITO VERIFICATION] Token validation failed:", error.message || error);

        // Handle specific configuration errors differently
        if (error.message && error.message.includes("Cognito Configuration Error")) {
            return res.status(500).json({
                status: "error",
                message: "Server Configuration Error: Auth service is improperly configured.",
                details: error.message
            });
        }

        return res.status(401).json({
            status: "error",
            message: "Unauthorized access: Invalid, expired, or tampered token.",
            details: error.message
        });
    }
};

module.exports = verifyToken;
