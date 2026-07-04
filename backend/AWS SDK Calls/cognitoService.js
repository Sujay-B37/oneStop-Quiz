/**
 * AWS SDK Calls/cognitoService.js
 * Description: Interacts with Amazon Cognito User Pool using AWS SDK v3.
 * Implements user sign-up and authentication (login).
 */

const { SignUpCommand, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { cognitoClient } = require("./awsConfig");

// Load Environment Configuration
const clientId = process.env.COGNITO_CLIENT_ID;

if (!clientId) {
    console.warn("WARNING: COGNITO_CLIENT_ID is not configured in environment variables.");
}

/**
 * Register a new user in the Amazon Cognito User Pool.
 * @param {string|null} username - Chosen username (optional).
 * @param {string} email - User email address.
 * @param {string} password - User password.
 * @returns {Promise<object>} Object containing userSub and verification details.
 */
const signUpUser = async (username, email, password) => {
    const userAttributes = [
        {
            Name: "email",
            Value: email
        }
    ];

    // Conditionally add preferred_username if provided
    if (username) {
        userAttributes.push({
            Name: "preferred_username",
            Value: username
        });
    }

    const input = {
        ClientId: clientId,
        Username: email, // Set Username as email to align with email login
        Password: password,
        UserAttributes: userAttributes
    };

    try {
        console.log(`[COGNITO SDK] Dispatching SignUpCommand for email: ${email}`);
        const command = new SignUpCommand(input);
        const response = await cognitoClient.send(command);
        return {
            userSub: response.UserSub,
            userConfirmed: response.UserConfirmed
        };
    } catch (error) {
        console.error("Cognito SignUp Error:", error);
        throw error;
    }
};

/**
 * Authenticate a user with Amazon Cognito User Pool.
 * @param {string} email - Registered email.
 * @param {string} password - User password.
 * @returns {Promise<object>} Cognito AuthenticationResult containing JWTs (IdToken, AccessToken, RefreshToken).
 */
const signInUser = async (email, password) => {
    const input = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password
        }
    };

    try {
        console.log(`[COGNITO SDK] Dispatching InitiateAuthCommand for email: ${email}`);
        const command = new InitiateAuthCommand(input);
        const response = await cognitoClient.send(command);
        return response.AuthenticationResult;
    } catch (error) {
        console.error("Cognito InitiateAuth Error:", error);
        throw error;
    }
};

module.exports = {
    signUpUser,
    signInUser
};
