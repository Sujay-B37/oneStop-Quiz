/**
 * Lambda Invoke/lambdaService.js (MOCK IMPLEMENTATION)
 * Description: Mimics remote AWS Lambda invocations by calculating quiz scores locally.
 * Returns the exact JSON structure expected by the resultController.
 */

/**
 * Invoke the mock score calculator locally.
 * @param {Array<string>} correctAnswers - List of correct answers from mock quiz db.
 * @param {Array<string>} userAnswers - List of user answers submitted by the client.
 * @returns {Promise<object>} Score calculation results.
 */
const invokeScoreCalculator = async (correctAnswers, userAnswers) => {
    // Mimic network latency of a Lambda call (e.g. 200ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Ensure inputs are arrays
    const correctArr = Array.isArray(correctAnswers) ? correctAnswers : [];
    const userArr = Array.isArray(userAnswers) ? userAnswers : [];

    let score = 0;
    const totalQuestions = correctArr.length;

    // Evaluate answers
    for (let i = 0; i < totalQuestions; i++) {
        const correctVal = correctArr[i];
        const userVal = userArr[i];

        if (correctVal !== undefined && userVal !== undefined) {
            const sanitizedCorrect = String(correctVal).trim().toLowerCase();
            const sanitizedUser = String(userVal).trim().toLowerCase();

            if (sanitizedCorrect === sanitizedUser) {
                score++;
            }
        }
    }

    console.log(`[MOCK LAMBDA] Calculated score: ${score}/${totalQuestions}`);

    return {
        score,
        totalQuestions
    };
};

module.exports = {
    invokeScoreCalculator
};
