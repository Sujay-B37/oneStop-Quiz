/**
 * Controllers/quizController.js
 * Description: Controller for handling quiz-related operations.
 * Interacts with dynamoService to fetch quiz data and sanitizes correct answers before returning.
 */

const { fetchQuizzes, fetchQuizById } = require("../AWS SDK Calls/dynamoService");

/**
 * Sanitizes a quiz object to remove 'correctAnswer' from the questions list.
 * This prevents clients from inspecting the response to cheat.
 * @param {object} quiz - The raw quiz record from DynamoDB.
 * @returns {object} The sanitized quiz record.
 */
const sanitizeQuiz = (quiz) => {
    if (!quiz) return null;
    
    // Deep clone/copy to avoid modifying the original database object
    const sanitized = JSON.parse(JSON.stringify(quiz));
    
    if (sanitized.questions && Array.isArray(sanitized.questions)) {
        sanitized.questions = sanitized.questions.map(q => {
            // Delete the correct answer property
            delete q.correctAnswer;
            return q;
        });
    }
    
    return sanitized;
};

/**
 * Fetch all quizzes.
 * Retrieves all quiz headers and questions (sanitized) from DynamoDB.
 */
exports.getAllQuizzes = async (req, res, next) => {
    try {
        console.log("Fetching all quizzes...");
        const quizzes = await fetchQuizzes();
        
        // Sanitize every quiz in the list
        const sanitizedQuizzes = quizzes.map(quiz => sanitizeQuiz(quiz));

        return res.status(200).json({
            status: "success",
            results: sanitizedQuizzes.length,
            data: sanitizedQuizzes
        });
    } catch (error) {
        console.error("Error in getAllQuizzes:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve quizzes.",
            details: error.message
        });
    }
};

/**
 * Fetch a single quiz by ID.
 * Retrieves quiz details by quizId parameter (sanitized) from DynamoDB.
 */
exports.getQuizById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Missing quiz ID parameter."
            });
        }

        console.log(`Fetching quiz with ID: ${id}`);
        const quiz = await fetchQuizById(id);

        if (!quiz) {
            return res.status(404).json({
                status: "error",
                message: `Quiz with ID ${id} not found.`
            });
        }

        // Sanitize the specific quiz questions
        const sanitizedQuiz = sanitizeQuiz(quiz);

        return res.status(200).json({
            status: "success",
            data: sanitizedQuiz
        });
    } catch (error) {
        console.error(`Error in getQuizById for ID ${req.params.id}:`, error);
        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve the quiz.",
            details: error.message
        });
    }
};