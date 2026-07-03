import React, { useState, useEffect, useRef } from 'react';
import './Quiz.css';

const Quiz = ({ quiz, onSubmitQuiz, onQuit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Maps questionIdx -> optionIndex (integer)
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIdx];

  // Start question timer
  useEffect(() => {
    setTimeLeft(30);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextOrSubmit(true); // Auto-advance/submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIdx]);

  const handleSelectOption = (optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const handleNextOrSubmit = (timeExpired = false) => {
    if (currentIdx === questions.length - 1) {
      clearInterval(timerRef.current);
      const totalTimeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      onSubmitQuiz(selectedAnswers, totalTimeSpent);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-error">
        <p>This quiz has no questions available.</p>
        <button onClick={onQuit} className="quiz-control-button">Back to Dashboard</button>
      </div>
    );
  }

  const progressPercentage = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      {/* Quiz Header */}
      <div className="quiz-meta-header">
        <button onClick={onQuit} className="quit-btn">Quit Quiz</button>
        <div className="quiz-subject-title">{quiz.subject} Quiz</div>
        <div className={`quiz-timer ${timeLeft < 10 ? 'timer-warning' : ''}`}>
          Time Left: {timeLeft}s
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <div className="progress-text">
        Question {currentIdx + 1} of {questions.length}
      </div>

      {/* Question Card */}
      <div className="question-card">
        {currentQuestion.topic && <span className="question-topic">{currentQuestion.topic}</span>}
        <h3 className="question-text">{currentQuestion.question}</h3>

        <div className="options-grid">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentIdx] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`option-button ${isSelected ? 'option-selected' : ''}`}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="quiz-navigation">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="quiz-nav-button prev-btn"
        >
          Previous
        </button>

        <button
          onClick={() => handleNextOrSubmit(false)}
          className="quiz-nav-button next-btn"
        >
          {currentIdx === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
