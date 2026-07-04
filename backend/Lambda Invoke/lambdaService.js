/**
 * Lambda Invoke/lambdaService.js
 * Description: Invokes the AWS Lambda function to evaluate quiz answers.
 * Uses AWS SDK v3 Lambda Client to execute the remote function synchronously.
 */

const { InvokeCommand } = require("@aws-sdk/client-lambda");
const { lambdaClient } = require("../AWS SDK Calls/awsConfig");

// Load the Lambda function name from environment variables with a fallback default
const LAMBDA_FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME || "scoreCalculator";

/**
 * Invoke the scoreCalculator Lambda function to compute the user's score.
 * @param {Array<string>} correctAnswers - List of correct answers from DynamoDB.
 * @param {Array<string>} userAnswers - List of user answers from request body.
 * @returns {Promise<object>} Calculation results containing score and totalQuestions.
 */
const invokeScoreCalculator = async (correctAnswers, userAnswers) => {
    // Construct the payload to send to Lambda
    const payload = JSON.stringify({
        correctAnswers,
        userAnswers
    });

    const params = {
        FunctionName: LAMBDA_FUNCTION_NAME,
        // The Payload must be passed as a Uint8Array or string in SDK v3
        Payload: new TextEncoder().encode(payload)
    };

    try {
        console.log(`[LAMBDA SDK] Invoking remote Lambda function: ${LAMBDA_FUNCTION_NAME}`);
        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        // Check if there was a function error (e.g. Lambda crashed during execution)
        if (response.FunctionError) {
            const errorDetails = new TextDecoder("utf-8").decode(response.Payload);
            console.error("Lambda function error response details:", errorDetails);
            throw new Error(`Lambda FunctionError: ${response.FunctionError}. Details: ${errorDetails}`);
        }

        // Decode the returned Payload (Uint8Array) to JSON string
        const responsePayload = new TextDecoder("utf-8").decode(response.Payload);
        const result = JSON.parse(responsePayload);

        console.log("[LAMBDA SDK] Lambda score calculation success:", result);
        return {
            score: typeof result.score === "number" ? result.score : 0,
            totalQuestions: typeof result.totalQuestions === "number" ? result.totalQuestions : correctAnswers.length
        };
    } catch (error) {
        console.error("Failed to invoke Lambda function:", error);
        throw error;
    }
};

module.exports = {
    invokeScoreCalculator
};
