/**
 * Controllers/resultController.js
 * Description: Handles submitting quiz answers and fetching results.
 * Fetches the correct answer key from DynamoDB, calls the Lambda service to evaluate the score,
 * and saves the result record in the Results DynamoDB table.
 */

const { fetchQuizById, saveResult, fetchResultsByUser } = require("../AWS SDK Calls/dynamoService");
const { invokeScoreCalculator } = require("../Lambda Invoke/lambdaService");

/**
 * Submit answers for a quiz.
 * Validates request body, fetches original quiz, calls score calculation Lambda,
 * and saves the result in DynamoDB.
 */
exports.submitQuiz = async (req, res, next) => {
    try {
        const { quizId, answers } = req.body;
        const userId = req.user.userId; // Extracted from verified Cognito JWT payload

        // Input validation
        if (!quizId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                status: "error",
                message: "Missing or invalid required fields: quizId (String), answers (Array)"
            });
        }

        // 1. Fetch original quiz from DynamoDB to retrieve correct answers
        console.log(`Fetching quiz ${quizId} to verify answers...`);
        const quiz = await fetchQuizById(quizId);

        if (!quiz) {
            return res.status(404).json({
                status: "error",
                message: `Quiz with ID ${quizId} not found.`
            });
        }

        if (!quiz.questions || !Array.isArray(quiz.questions)) {
            return res.status(500).json({
                status: "error",
                message: "Quiz format is invalid (missing questions list)."
            });
        }

        // 2. Extract correct answers from quiz questions
        const correctAnswers = quiz.questions.map(q => q.correctAnswer);

        // Ensure user answers array size aligns with questions size (pad or truncate if necessary)
        // Or simply send them to Lambda for evaluation.
        console.log(`Invoking Lambda scoreCalculator for quiz: ${quizId}`);
        const calculationResult = await invokeScoreCalculator(correctAnswers, answers);

        const score = calculationResult.score;
        const totalQuestions = calculationResult.totalQuestions;

        // 3. Store the result score in DynamoDB Results table
        console.log(`Saving quiz score in Results table for userId: ${userId}`);
        const savedRecord = await saveResult(userId, quizId, score, totalQuestions, answers);

        return res.status(201).json({
            status: "success",
            message: "Quiz submitted and evaluated successfully.",
            data: savedRecord
        });
    } catch (error) {
        console.error("Error in submitQuiz controller:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to submit and evaluate quiz.",
            details: error.message
        });
    }
};

/**
 * Fetch past quiz results for the currently authenticated user.
 */
exports.getResults = async (req, res, next) => {
    try {
        const userId = req.user.userId; // Extracted from Cognito verification
        console.log(`Fetching quiz history for user: ${userId}`);
        
        const results = await fetchResultsByUser(userId);

        return res.status(200).json({
            status: "success",
            results: results.length,
            data: results
        });
    } catch (error) {
        console.error(`Error in getResults controller for user ${req.user.userId}:`, error);
        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve quiz results.",
            details: error.message
        });
    }
};