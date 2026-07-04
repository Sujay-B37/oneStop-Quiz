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

// Active mock flag (permanently disabled for live AWS phase)
const useMocks = false;

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

// API Service Interfaces
export const apiService = {
  // Restore session from localStorage token
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = parseJwt(token);
    if (!decoded) return null;

    // Check if token has expired (exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.warn('Saved Cognito token has expired. Clearing session.');
      localStorage.removeItem('token');
      return null;
    }

    return {
      email: decoded.email,
      username: decoded.preferred_username || (decoded.email ? decoded.email.split('@')[0] : 'Quizzer')
    };
  },

  // Authentication
  login: async (email, password) => {
    try {
      const response = await client.post('/api/auth/login', { email, password });
      const idToken = response.data.data.idToken;
      const decoded = parseJwt(idToken);
      return {
        token: idToken,
        user: {
          email: decoded?.email || email,
          username: decoded?.preferred_username || (decoded?.email ? decoded.email.split('@')[0] : (email ? email.split('@')[0] : 'Quizzer'))
        }
      };
    } catch (err) {
      throw err;
    }
  },

  signup: async (username, email, password) => {
    try {
      // Backend expects username, email, password
      const response = await client.post('/api/auth/signup', { username, email, password });
      return response.data;
    } catch (err) {
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
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      }))
    };
  },

  // Submit Quiz Answers
  submitQuiz: async (subjectId, answersList) => {
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
      throw err;
    }
  },

  // Results History
  getResults: async () => {
    try {
      const response = await client.get('/api/result');
      return response.data.data.map((r, idx) => {
        // Map database quizIds to human-readable names
        let subjectName = r.quizId;
        if (r.quizId === 'quiz-math') subjectName = 'Mathematics';
        else if (r.quizId === 'quiz-physics') subjectName = 'Physics';
        else if (r.quizId === 'quiz-chemistry') subjectName = 'Chemistry';
        else if (r.quizId === 'quiz-aws-basics') subjectName = 'AWS Academy Basics';
        else if (r.quizId === 'quiz-js-trivia') subjectName = 'JavaScript Fundamentals';

        return {
          id: idx,
          subject: subjectName,
          score: r.score,
          total: 10, // Always show score out of 10 in UI history views
          date: r.timestamp ? r.timestamp.split('T')[0] : new Date().toISOString().split('T')[0]
        };
      });
    } catch (err) {
      throw err;
    }
  }
};
