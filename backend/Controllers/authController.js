/**
 * Controllers/authController.js
 * Description: Controller for handling user authentication requests.
 * Validates request parameters and coordinates calls to Cognito and DynamoDB.
 */

const { signUpUser, signInUser } = require("../AWS SDK Calls/cognitoService");
const { saveUser } = require("../AWS SDK Calls/dynamoService");

/**
 * Handle user registration.
 * Registers user in AWS Cognito and saves record in DynamoDB.
 */
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Basic Input Validation (username is optional for email-only configuration)
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields: email, password"
            });
        }

        // Fallback username to email prefix if not explicitly provided
        const finalUsername = username || email.split("@")[0];

        // 1. Sign up user in Cognito
        console.log(`Signing up user in Cognito: ${email}`);
        const cognitoResult = await signUpUser(username, email, password);
        const { userSub } = cognitoResult;

        // 2. Save user record in DynamoDB
        console.log(`Saving user record in DynamoDB for userId: ${userSub}`);
        await saveUser(userSub, finalUsername, email);

        return res.status(201).json({
            status: "success",
            message: "User registered successfully. Please verify your email if required.",
            data: {
                userId: userSub,
                username: finalUsername,
                email
            }
        });
    } catch (error) {
        console.error("Signup error in authController:", error);
        
        // Translate Cognito/DynamoDB specific errors to user-friendly messages
        let statusCode = 500;
        let errMsg = "An error occurred during signup.";

        if (error.name === "UsernameExistsException") {
            statusCode = 400;
            errMsg = "A user with this email or username already exists.";
        } else if (error.name === "InvalidPasswordException") {
            statusCode = 400;
            errMsg = error.message || "Password does not meet complexity requirements.";
        } else if (error.name === "InvalidParameterException") {
            statusCode = 400;
            errMsg = error.message || "Invalid email or parameters.";
        }

        return res.status(statusCode).json({
            status: "error",
            message: errMsg,
            details: error.message
        });
    }
};

/**
 * Handle user login.
 * Authenticates user credentials using AWS Cognito.
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Basic Input Validation
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields: email, password"
            });
        }

        // Authenticate with Cognito
        console.log(`Authenticating user: ${email}`);
        const authResult = await signInUser(email, password);

        return res.status(200).json({
            status: "success",
            message: "Authentication successful",
            data: {
                accessToken: authResult.AccessToken,
                idToken: authResult.IdToken,
                refreshToken: authResult.RefreshToken,
                expiresIn: authResult.ExpiresIn
            }
        });
    } catch (error) {
        console.error("Login error in authController:", error);

        let statusCode = 401;
        let errMsg = "Authentication failed.";

        if (error.name === "UserNotConfirmedException") {
            errMsg = "User email verification is pending.";
        } else if (error.name === "UserNotFoundException" || error.name === "NotAuthorizedException") {
            errMsg = "Incorrect email or password.";
        } else if (error.name === "PasswordResetRequiredException") {
            errMsg = "Password reset is required.";
        } else {
            statusCode = 500;
            errMsg = error.message || "An error occurred during login.";
        }

        return res.status(statusCode).json({
            status: "error",
            message: errMsg,
            details: error.message
        });
    }
};