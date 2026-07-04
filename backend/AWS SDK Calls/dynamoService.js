/**
 * AWS SDK Calls/dynamoService.js
 * Description: Interacts with Amazon DynamoDB using AWS SDK v3 (DynamoDBDocumentClient).
 * Provides methods for user registration, quiz retrieval, score saving, and score retrieval.
 * Automatically normalizes quizId format for frontend compatibility.
 */

const { PutCommand, GetCommand, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDbDocumentClient } = require("./awsConfig");

// Load table names from environment variables with fallback defaults
const USERS_TABLE = process.env.USERS_TABLE || "Users";
const QUIZZES_TABLE = process.env.QUIZZES_TABLE || "Quizzes";
const RESULTS_TABLE = process.env.RESULTS_TABLE || "Results";

/**
 * Helper to normalize quizId. Ensures it is prefixed with "quiz-" to match database structure.
 * E.g., "math" -> "quiz-math", "quiz-physics" -> "quiz-physics"
 */
const normalizeQuizId = (quizId) => {
    if (!quizId) return "";
    return quizId.startsWith("quiz-") ? quizId : `quiz-${quizId}`;
};

/**
 * Save user metadata in the Users table.
 * @param {string} userId - The Cognito sub ID.
 * @param {string} username - User username.
 * @param {string} email - User email address.
 */
const saveUser = async (userId, username, email) => {
    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId,
            username,
            email,
            createdAt: new Date().toISOString()
        }
    };

    try {
        console.log(`[DYNAMODB SDK] Saving user ${userId} to table ${USERS_TABLE}...`);
        const command = new PutCommand(params);
        await dynamoDbDocumentClient.send(command);
        console.log(`[DYNAMODB SDK] Successfully saved user ${userId}`);
    } catch (error) {
        console.error("DynamoDB saveUser Error:", error);
        throw error;
    }
};

/**
 * Scan the Quizzes table to fetch all quizzes.
 * @returns {Promise<Array>} Array of quizzes.
 */
const fetchQuizzes = async () => {
    const params = {
        TableName: QUIZZES_TABLE
    };

    try {
        console.log(`[DYNAMODB SDK] Scanning table ${QUIZZES_TABLE}...`);
        const command = new ScanCommand(params);
        const response = await dynamoDbDocumentClient.send(command);
        return response.Items || [];
    } catch (error) {
        console.error("DynamoDB fetchQuizzes Error:", error);
        throw error;
    }
};

/**
 * Fetch a single quiz details by ID.
 * @param {string} quizId - Unique identifier of the quiz.
 * @returns {Promise<object|null>} Quiz object or null if not found.
 */
const fetchQuizById = async (quizId) => {
    const dbQuizId = normalizeQuizId(quizId);
    const params = {
        TableName: QUIZZES_TABLE,
        Key: {
            quizId: dbQuizId
        }
    };

    try {
        console.log(`[DYNAMODB SDK] Getting item from ${QUIZZES_TABLE} with quizId: ${dbQuizId}...`);
        const command = new GetCommand(params);
        const response = await dynamoDbDocumentClient.send(command);
        return response.Item || null;
    } catch (error) {
        console.error(`DynamoDB fetchQuizById Error for ID ${dbQuizId}:`, error);
        throw error;
    }
};

/**
 * Save the calculated quiz score and user answers to the Results table.
 * @param {string} userId - Cognito unique identifier (sub).
 * @param {string} quizId - ID of the quiz taken.
 * @param {number} score - Score returned by Lambda.
 * @param {number} totalQuestions - Total count of questions.
 * @param {Array} answers - User submitted answers list.
 * @returns {Promise<object>} The stored result object.
 */
const saveResult = async (userId, quizId, score, totalQuestions, answers) => {
    const dbQuizId = normalizeQuizId(quizId);
    const timestamp = new Date().toISOString();
    const resultItem = {
        userId,
        quizId: dbQuizId, // Sort key
        score,
        totalQuestions,
        answers,
        timestamp
    };

    const params = {
        TableName: RESULTS_TABLE,
        Item: resultItem
    };

    try {
        console.log(`[DYNAMODB SDK] Saving quiz result to ${RESULTS_TABLE} for user: ${userId}, quiz: ${dbQuizId}`);
        const command = new PutCommand(params);
        await dynamoDbDocumentClient.send(command);
        return resultItem;
    } catch (error) {
        console.error("DynamoDB saveResult Error:", error);
        throw error;
    }
};

/**
 * Retrieve past results for a specific user, sorted from newest to oldest.
 * @param {string} userId - Cognito User ID (sub).
 * @returns {Promise<Array>} List of past quiz results.
 */
const fetchResultsByUser = async (userId) => {
    const params = {
        TableName: RESULTS_TABLE,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };

    try {
        console.log(`[DYNAMODB SDK] Querying ${RESULTS_TABLE} for user: ${userId}`);
        const command = new QueryCommand(params);
        const response = await dynamoDbDocumentClient.send(command);
        
        // Sort descending in Javascript since we sort by timestamp which is not the Sort Key (the sort key is quizId)
        const items = response.Items || [];
        return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
        console.error(`DynamoDB fetchResultsByUser Error for user ${userId}:`, error);
        throw error;
    }
};

module.exports = {
    saveUser,
    fetchQuizzes,
    fetchQuizById,
    saveResult,
    fetchResultsByUser
};
