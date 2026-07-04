/**
 * scoreCalculator.js
 * Description: AWS Lambda function handler that computes the quiz score.
 * Compares user answers with the database correct answers key.
 * This function does not perform any database operations.
 */

/**
 * Lambda event handler for score calculation.
 * @param {object} event - Input payload. Expected format: { correctAnswers: Array<string>, userAnswers: Array<string> }
 * @returns {Promise<object>} Scored result containing score and totalQuestions.
 */
exports.handler = async (event) => {
    console.log("Lambda scoreCalculator invoked with event:", JSON.stringify(event));

    // Fallbacks to handle empty or malformed input structures safely
    const correctAnswers = event.correctAnswers || [];
    const userAnswers = event.userAnswers || [];

    if (!Array.isArray(correctAnswers)) {
        console.error("Function error: correctAnswers is not a valid array.");
        throw new Error("Invalid input: correctAnswers must be an array.");
    }

    let score = 0;
    const totalQuestions = correctAnswers.length;

    // Iterate and compare user answers with correct answers
    for (let i = 0; i < totalQuestions; i++) {
        const correctVal = correctAnswers[i];
        const userVal = userAnswers[i];

        if (correctVal !== undefined && userVal !== undefined) {
            // Trim and convert to string for robust case-insensitive comparison or string normalization
            const sanitizedCorrect = String(correctVal).trim().toLowerCase();
            const sanitizedUser = String(userVal).trim().toLowerCase();

            if (sanitizedCorrect === sanitizedUser) {
                score++;
            }
        }
    }

    const result = {
        score,
        totalQuestions
    };

    console.log("Calculated scoring result:", JSON.stringify(result));
    return result;
};
