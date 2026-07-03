/**
 * AWS SDK Calls/awsConfig.js
 * Description: Centralizes client initialization for AWS SDK v3.
 * Configures and exports Cognito, DynamoDB, and Lambda client instances.
 */

const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { LambdaClient } = require("@aws-sdk/client-lambda");

const region = process.env.AWS_REGION || "us-east-1";

// Prepare configuration options
const config = {
    region
};

// If AWS credentials are set explicitly in the environment variables, use them.
// Note: In an EC2 or ECS deployment, IAM Instance Profiles / Task Roles are preferred,
// in which case these environment variables are not required.
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
}

// 1. Initialize AWS Cognito client
const cognitoClient = new CognitoIdentityProviderClient(config);

// 2. Initialize AWS DynamoDB clients (and Wrap with DynamoDBDocumentClient for ease of use)
const baseDdbClient = new DynamoDBClient(config);
const dynamoDbDocumentClient = DynamoDBDocumentClient.from(baseDdbClient, {
    marshallOptions: {
        removeUndefinedValues: true, // Auto-removes undefined values from payloads
        convertEmptyValues: true     // Auto-converts empty string values
    }
});

// 3. Initialize AWS Lambda client
const lambdaClient = new LambdaClient(config);

module.exports = {
    cognitoClient,
    dynamoDbDocumentClient,
    lambdaClient
};
