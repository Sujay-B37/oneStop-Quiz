/**
 * scratch/importQuizzes.js
 * Description: Automates reading and importing the quiz JSON dataset into DynamoDB.
 * Targets the teammate's JSON file located in the frontend components directory.
 * Runs locally using your AWS credentials.
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load active credentials and config

const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDbDocumentClient } = require("../AWS SDK Calls/awsConfig");

const QUIZZES_TABLE = process.env.QUIZZES_TABLE || "Quizzes";

// Path to teammate's questions JSON in frontend folder
const jsonFilePath = path.join(__dirname, "..", "..", "frontend", "src", "components", "Quiz", "questions.json");

const importData = async () => {
    try {
        console.log(`Checking for quizzes dataset at: ${jsonFilePath}`);
        if (!fs.existsSync(jsonFilePath)) {
            console.error(`ERROR: questions.json not found at ${jsonFilePath}`);
            process.exit(1);
        }

        // 1. Read and parse JSON file
        const fileContent = fs.readFileSync(jsonFilePath, "utf8");
        const data = JSON.parse(fileContent);

        if (!data.quizzes || !Array.isArray(data.quizzes)) {
            console.error("ERROR: Invalid JSON structure. Root object must contain a 'quizzes' array.");
            process.exit(1);
        }

        console.log(`Found ${data.quizzes.length} quiz(zes) to import.`);

        // 2. Restructure and import each quiz
        for (const quiz of data.quizzes) {
            if (!quiz.subject) {
                console.warn("WARNING: Skipping a quiz because it lacks a 'subject' name.");
                continue;
            }

            // Generate unique, url-friendly quizId slug (e.g., "Math" -> "quiz-math")
            const quizId = `quiz-${quiz.subject.toLowerCase().replace(/\s+/g, "-")}`;
            const title = quiz.title || `${quiz.subject} Quiz`;
            const description = quiz.description || `Test your knowledge on topics related to ${quiz.subject}`;
            const topics = quiz.topics || [];

            if (!quiz.questions || !Array.isArray(quiz.questions)) {
                console.warn(`WARNING: Skipping quiz '${title}' because it has no questions list.`);
                continue;
            }

            // Normalize questions structure (ensuring correctAnswer maps cleanly)
            const normalizedQuestions = quiz.questions.map((q, idx) => {
                const questionText = q.questionText || q.question || `Question ${idx + 1}`;
                const options = q.options || [];
                
                // Fetch correct answer, support both standard, underscores, and answer fallbacks
                const correctAnswer = q.correctAnswer || q.correct_answer || q.answer;
                const explanation = q.explanation || "";

                if (!correctAnswer) {
                    console.warn(`[Normalized Question Warn]: Question ${idx + 1} of Quiz '${title}' is missing a correctAnswer attribute.`);
                }

                return {
                    questionText,
                    options,
                    correctAnswer,
                    explanation
                };
            });

            // Construct DynamoDB Item
            const quizItem = {
                quizId,
                title,
                description,
                topics,
                questions: normalizedQuestions
            };

            console.log(`Importing quiz: '${title}' (quizId: ${quizId}) with ${normalizedQuestions.length} questions...`);

            // Execute PutCommand
            const params = {
                TableName: QUIZZES_TABLE,
                Item: quizItem
            };

            await dynamoDbDocumentClient.send(new PutCommand(params));
            console.log(`SUCCESS: Imported quiz '${title}' successfully.`);
        }

        console.log("\nAll quizzes successfully processed and imported to DynamoDB! 🎉");
    } catch (error) {
        console.error("FATAL: An error occurred during database import:", error);
    }
};

// Execute
importData();
