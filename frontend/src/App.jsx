import React, { useState } from 'react';
import Login from './components/Login/Login.jsx';
import Signup from './components/Signup/Signup.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Quiz from './components/Quiz/Quiz.jsx';
import Result from './components/Result/Result.jsx';
import { apiService } from './services/apiService.js';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'dashboard', 'quiz', 'result'
  const [user, setUser] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleToggleView = () => {
    setCurrentView((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  const handleAuthSuccess = (userData) => {
    setUser({
      email: userData.user.email,
      username: userData.user.username || 'Quizzer'
    });
    localStorage.setItem('token', userData.token);
    setCurrentView('dashboard');
  };

  const handleSignupSuccess = async (email, password) => {
    setLoading(true);
    try {
      const authData = await apiService.login(email, password);
      handleAuthSuccess(authData);
    } catch (err) {
      console.error('Auto-login after signup failed:', err);
      alert('Signup successful! Please log in manually.');
      setCurrentView('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveQuiz(null);
    setSelectedAnswers({});
    setResultData(null);
    localStorage.removeItem('token');
    setCurrentView('login');
  };

  const handleUpdateUsername = (newUsername) => {
    setUser((prev) => (prev ? { ...prev, username: newUsername } : null));
  };

  // Helper to select exactly 10 random questions from the subject pool
  const getRandomTenQuestions = (questionsList) => {
    if (!questionsList || questionsList.length <= 10) {
      return questionsList;
    }
    const shuffled = [...questionsList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  };

  // Asynchronous Quiz loader from API
  const handleSelectQuiz = async (subjectId) => {
    setLoading(true);
    try {
      const data = await apiService.getQuiz(subjectId);
      // Pick exactly 10 questions at random
      const quizSubset = {
        id: subjectId,
        subject: data.subject,
        questions: getRandomTenQuestions(data.questions)
      };
      setActiveQuiz(quizSubset);
      setSelectedAnswers({});
      setResultData(null);
      setCurrentView('quiz');
    } catch (err) {
      console.error('Error loading quiz:', err);
      alert('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Asynchronous Quiz scoring submission to API
  const handleSubmitQuiz = async (answers, timeSpent) => {
    setSelectedAnswers(answers);
    setLoading(true);
    try {
      // Map answers to the array of strings required by the backend
      const answersList = activeQuiz.questions.map((q, idx) => {
        const selectedOptionIdx = answers[idx];
        return selectedOptionIdx !== undefined ? q.options[selectedOptionIdx] : '';
      });

      // POST to submit via apiService
      const submitResponse = await apiService.submitQuiz(activeQuiz.id, answersList);

      setResultData({
        score: submitResponse.score,
        total: submitResponse.total,
        percentage: submitResponse.percentage,
        timeSpent: timeSpent
      });
      setCurrentView('result');
    } catch (err) {
      console.error('Error submitting quiz scores:', err);
      alert('Failed to submit quiz results to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    setActiveQuiz(null);
    setSelectedAnswers({});
    setResultData(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-title-row">
          <svg className="app-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <h1>OneStop Quiz</h1>
        </div>
        <p className="app-subtitle">Challenge your skills, track your progress</p>
      </header>

      <main className="app-main">
        {loading && (
          <div className="global-loader-overlay">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {!loading && currentView === 'login' && (
          <Login onToggleView={handleToggleView} onLoginSuccess={handleAuthSuccess} />
        )}

        {!loading && currentView === 'signup' && (
          <Signup onToggleView={handleToggleView} onSignupSuccess={handleSignupSuccess} />
        )}

        {!loading && currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            onSelectQuiz={handleSelectQuiz}
            onLogout={handleLogout}
            onUpdateUsername={handleUpdateUsername}
          />
        )}

        {!loading && currentView === 'quiz' && activeQuiz && (
          <Quiz
            quiz={activeQuiz}
            onSubmitQuiz={handleSubmitQuiz}
            onQuit={handleReturnToDashboard}
          />
        )}

        {!loading && currentView === 'result' && activeQuiz && (
          <Result
            quiz={activeQuiz}
            selectedAnswers={selectedAnswers}
            resultData={resultData}
            onReturnToDashboard={handleReturnToDashboard}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} OneStop Quiz. Powered by AWS.</p>
      </footer>
    </div>
  );
}

export default App;
