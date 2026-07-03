import axios from 'axios';
import quizData from '../components/Quiz/questions.json';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Set up Axios client
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to attach JWT token if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Active mock flag (falls back automatically if server is down)
let useMocks = false;

// Mock database states
const mockUser = {
  name: 'Quizzer',
  email: 'quizzer@example.com'
};

const mockSubjectsList = [
  { id: 'quiz-aws-basics', name: 'AWS Academy Basics' },
  { id: 'quiz-js-trivia', name: 'JavaScript Fundamentals' }
];

// Mock quiz questions for offline fallback
const customMockQuestions = {
  'quiz-aws-basics': {
    subject: 'AWS Academy Basics',
    questions: [
      {
        id: 1,
        question: 'Which AWS service is used to run virtual server instances in the cloud?',
        options: ['Amazon S3', 'Amazon EC2', 'AWS Lambda', 'Amazon RDS'],
        correct_answer: 'Amazon EC2'
      },
      {
        id: 2,
        question: 'What does S3 stand for in Amazon S3?',
        options: ['Simple Storage Service', 'Secure Server System', 'Super Speed Storage', 'System Security Server'],
        correct_answer: 'Simple Storage Service'
      },
      {
        id: 3,
        question: 'Which DynamoDB primary key type is composed of both a partition key and a sort key?',
        options: ['Simple Primary Key', 'Composite Primary Key', 'Global Secondary Key', 'Local Secondary Key'],
        correct_answer: 'Composite Primary Key'
      }
    ]
  },
  'quiz-js-trivia': {
    subject: 'JavaScript Fundamentals',
    questions: [
      {
        id: 1,
        question: 'Which keyword is used to declare a block-scoped variable that cannot be reassigned?',
        options: ['var', 'let', 'const', 'make'],
        correct_answer: 'const'
      },
      {
        id: 2,
        question: "What is the output of typeof null in JavaScript?",
        options: ["'null'", "'undefined'", "'object'", "'string'"],
        correct_answer: "'object'"
      },
      {
        id: 3,
        question: 'Which function is used to parse a JSON string into a JavaScript object?',
        options: ['JSON.stringify()', 'JSON.parse()', 'Object.parse()', 'JSON.toObject()'],
        correct_answer: 'JSON.parse()'
      }
    ]
  }
};

const mockResultsHistory = [
  { subject: 'AWS Academy Basics', score: 3, total: 3, percentage: 100, date: '2026-07-02' },
  { subject: 'JavaScript Fundamentals', score: 2, total: 3, percentage: 67, date: '2026-07-01' }
];

// Helper to decode JWT payload client-side
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Helper to check server availability (ping the root health check)
const checkConnection = async () => {
  try {
    await axios.get(`${API_URL}/`, { timeout: 1500 });
    useMocks = false;
  } catch (err) {
    console.warn('Backend server unreachable. Enabling mock-mode fallbacks.');
    useMocks = true;
  }
};

// Auto-run connection check
checkConnection();

// API Service Interfaces
export const apiService = {
  // Authentication
  login: async (email, password) => {
    if (useMocks) {
      console.log('[Mock API] POST /login called');
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { token: 'mock-jwt-token', user: { email, username: 'Quizzer' } };
    }
    try {
      const response = await client.post('/api/auth/login', { email, password });
      const idToken = response.data.data.idToken;
      const decoded = parseJwt(idToken);
      return {
        token: idToken,
        user: {
          email: decoded?.email || email,
          username: decoded?.preferred_username || 'Quizzer'
        }
      };
    } catch (err) {
      if (!err.response) { useMocks = true; return apiService.login(email, password); }
      throw err;
    }
  },

  signup: async (username, email, password) => {
    if (useMocks) {
      console.log('[Mock API] POST /signup called');
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { status: 'success', data: { username, email } };
    }
    try {
      // Backend expects username, email, password
      const response = await client.post('/api/auth/signup', { username, email, password });
      return response.data;
    } catch (err) {
      if (!err.response) { useMocks = true; return apiService.signup(username, email, password); }
      throw err;
    }
  },

  // Subjects List
  getSubjects: async () => {
    console.log('[API Service] Loading subjects from questions.json');
    const localQuizzes = quizData.quizzes || [];
    return localQuizzes.map((q) => ({
      id: q.subject.toLowerCase(),
      name: q.subject
    }));
  },

  // Quiz Questions
  getQuiz: async (subjectId) => {
    console.log(`[API Service] Loading quiz ${subjectId} from questions.json`);
    const localSub = quizData.quizzes?.find(
      (q) => q.subject.toLowerCase() === subjectId.toLowerCase()
    );
    if (!localSub) {
      throw new Error(`Quiz subject ${subjectId} not found in questions.json`);
    }
    return {
      subject: localSub.subject,
      questions: localSub.questions.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options
      }))
    };
  },

  // Submit Quiz Answers
  submitQuiz: async (subjectId, answersList) => {
    if (useMocks) {
      console.log(`[Mock API] POST /submit called for subject ${subjectId}`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      let score = 0;
      let questions = [];

      const customSub = customMockQuestions[subjectId.toLowerCase()];
      if (customSub) {
        questions = customSub.questions;
      }

      answersList.forEach((userAnsVal, idx) => {
        const questionObj = questions[idx];
        if (questionObj) {
          if (userAnsVal === questionObj.correct_answer) {
            score++;
          }
        }
      });

      const total = questions.length > 0 ? questions.length : 3;
      const percentage = Math.round((score / total) * 100);

      // Save to mock history in-memory
      const newRecord = {
        subject: customSub ? customSub.subject : subjectId.toUpperCase(),
        score,
        total,
        percentage,
        date: new Date().toISOString().split('T')[0]
      };
      mockResultsHistory.unshift(newRecord);

      return { score, total, percentage };
    }
    try {
      // POST to /api/result/submit
      const response = await client.post('/api/result/submit', {
        quizId: subjectId,
        answers: answersList
      });
      const data = response.data.data;
      return {
        score: data.score,
        total: data.totalQuestions,
        percentage: Math.round((data.score / data.totalQuestions) * 100)
      };
    } catch (err) {
      if (!err.response) { useMocks = true; return apiService.submitQuiz(subjectId, answersList); }
      throw err;
    }
  },

  // Results History
  getResults: async () => {
    if (useMocks) {
      console.log('[Mock API] GET /results called');
      return mockResultsHistory;
    }
    try {
      const response = await client.get('/api/result');
      return response.data.data.map((r, idx) => ({
        id: idx,
        subject: r.quizId === 'quiz-aws-basics' ? 'AWS Academy Basics' : 
                 r.quizId === 'quiz-js-trivia' ? 'JavaScript Fundamentals' : r.quizId,
        score: r.score,
        total: r.totalQuestions,
        date: r.timestamp ? r.timestamp.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    } catch (err) {
      if (!err.response) { useMocks = true; return apiService.getResults(); }
      throw err;
    }
  }
};
