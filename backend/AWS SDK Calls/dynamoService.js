/**
 * AWS SDK Calls/dynamoService.js (MOCK IMPLEMENTATION)
 * Description: Mimics AWS DynamoDB operations using local memory arrays.
 * Contains mock tables for Users, Quizzes, and Results to allow local testing.
 */

// In-Memory Database Arrays
const mockUsers = [];
const mockResults = [];

// Static Mock Quiz Catalog
const mockQuizzes = [
    {
        quizId: "quiz-aws-basics",
        title: "AWS Academy Basics",
        description: "Test your fundamental knowledge of AWS core services, cloud concepts, and terminology.",
        questions: [
            {
                questionText: "Which AWS service is used to run virtual server instances in the cloud?",
                options: ["Amazon S3", "Amazon EC2", "AWS Lambda", "Amazon RDS"],
                correctAnswer: "Amazon EC2"
            },
            {
                questionText: "What does S3 stand for in Amazon S3?",
                options: ["Simple Storage Service", "Secure Server System", "Super Speed Storage", "System Security Server"],
                correctAnswer: "Simple Storage Service"
            },
            {
                questionText: "Which DynamoDB primary key type is composed of both a partition key and a sort key?",
                options: ["Simple Primary Key", "Composite Primary Key", "Global Secondary Key", "Local Secondary Key"],
                correctAnswer: "Composite Primary Key"
            }
        ]
    },
    {
        quizId: "quiz-js-trivia",
        title: "JavaScript Fundamentals",
        description: "Challenge yourself with basic JavaScript concepts, scope, and variable assignments.",
        questions: [
            {
                questionText: "Which keyword is used to declare a block-scoped variable that cannot be reassigned?",
                options: ["var", "let", "const", "make"],
                correctAnswer: "const"
            },
            {
                questionText: "What is the output of typeof null in JavaScript?",
                options: ["'null'", "'undefined'", "'object'", "'string'"],
                correctAnswer: "'object'"
            },
            {
                questionText: "Which function is used to parse a JSON string into a JavaScript object?",
                options: ["JSON.stringify()", "JSON.parse()", "Object.parse()", "JSON.toObject()"],
                correctAnswer: "JSON.parse()"
            }
        ]
    }
];

/**
 * Save user metadata in mock Users database.
 * @param {string} userId - Cognito Sub UUID.
 * @param {string} username - User username.
 * @param {string} email - User email address.
 */
const saveUser = async (userId, username, email) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Latency simulation
    
    const userRecord = {
        userId,
        username,
        email,
        createdAt: new Date().toISOString()
    };
    
    mockUsers.push(userRecord);
    console.log(`[MOCK DYNAMODB] Saved user record:`, userRecord);
};

/**
 * Fetch all mock quizzes.
 * @returns {Promise<Array>} List of quizzes.
 */
const fetchQuizzes = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockQuizzes;
};

/**
 * Fetch mock quiz by ID.
 * @param {string} quizId - ID of the quiz.
 * @returns {Promise<object|null>} Quiz object or null.
 */
const fetchQuizById = async (quizId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const quiz = mockQuizzes.find(q => q.quizId === quizId);
    return quiz || null;
};

/**
 * Save score and response results in mock Results database.
 * @param {string} userId - User identifier (Cognito sub).
 * @param {string} quizId - ID of the quiz taken.
 * @param {number} score - Scored answers count.
 * @param {number} totalQuestions - Questions count.
 * @param {Array} answers - User submitted answers.
 * @returns {Promise<object>} The stored results record.
 */
const saveResult = async (userId, quizId, score, totalQuestions, answers) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const resultItem = {
        userId,
        timestamp: new Date().toISOString(),
        quizId,
        score,
        totalQuestions,
        answers
    };

    mockResults.push(resultItem);
    console.log(`[MOCK DYNAMODB] Stored quiz result:`, resultItem);
    return resultItem;
};

/**
 * Query results history by userId (sorted descending by timestamp).
 * @param {string} userId - User identifier.
 * @returns {Promise<Array>} Chronological list of user results.
 */
const fetchResultsByUser = async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Filter and sort descending by timestamp string
    const results = mockResults
        .filter(r => r.userId === userId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        
    return results;
};

module.exports = {
    saveUser,
    fetchQuizzes,
    fetchQuizById,
    saveResult,
    fetchResultsByUser,
    _mockUsers: mockUsers,       // Exported for debug/introspection
    _mockResults: mockResults    // Exported for debug/introspection
};
