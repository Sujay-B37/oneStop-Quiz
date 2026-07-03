import React from 'react';
import './Result.css';

const Result = ({ quiz, selectedAnswers, resultData, onReturnToDashboard }) => {
  const questions = quiz.questions || [];

  const score = resultData?.score !== undefined ? resultData.score : 0;
  const totalQuestions = resultData?.total !== undefined ? resultData.total : questions.length;
  const percentage = resultData?.percentage !== undefined ? resultData.percentage : 0;
  const timeSpent = resultData?.timeSpent || 0;

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  // Determine feedback message
  let feedbackMessage = 'Keep practicing!';
  let feedbackClass = 'feedback-average';
  if (percentage >= 80) {
    feedbackMessage = 'Excellent work! You nailed it!';
    feedbackClass = 'feedback-excellent';
  } else if (percentage >= 50) {
    feedbackMessage = 'Good job! A bit more review and you will get a perfect score.';
    feedbackClass = 'feedback-good';
  }

  return (
    <div className="result-container">
      {/* Score Summary Card */}
      <div className="score-summary-card">
        <div className="auth-header">
          <h2>Quiz Completed!</h2>
          <p className={feedbackClass}>{feedbackMessage}</p>
        </div>

        <div className="score-circle-container">
          <div className="score-circle">
            <span className="score-number">{score}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{totalQuestions}</span>
          </div>
          <div className="score-percentage">{percentage}% Score</div>
        </div>

        <div className="result-details-grid">
          <div className="result-detail">
            <span className="detail-label">Subject</span>
            <span className="detail-value">{quiz.subject}</span>
          </div>
          {timeSpent > 0 && (
            <div className="result-detail">
              <span className="detail-label">Time Taken</span>
              <span className="detail-value">{formatTime(timeSpent)}</span>
            </div>
          )}
        </div>

        <button onClick={onReturnToDashboard} className="auth-button back-dashboard-btn">
          Go to Dashboard
        </button>
      </div>

      {/* Review Section */}
      <div className="review-section">
        <h3>Question Review</h3>
        <div className="review-list">
          {questions.map((q, idx) => {
            const userAnswerIdx = selectedAnswers[idx];
            const userAnswerText = userAnswerIdx !== undefined ? q.options[userAnswerIdx] : null;
            const isCorrect = userAnswerText === q.correct_answer;

            return (
              <div key={idx} className={`review-card ${isCorrect ? 'review-correct' : 'review-incorrect'}`}>
                <div className="review-card-header">
                  <span className="question-number">Question {idx + 1}</span>
                  <span className={`status-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <h4 className="review-question-text">{q.question}</h4>

                <div className="review-answers">
                  <div className="answer-row">
                    <span className="answer-label">Your Answer:</span>
                    <span className={`answer-value ${isCorrect ? 'txt-correct' : 'txt-incorrect'}`}>
                      {userAnswerText || <span className="unanswered">Unanswered</span>}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="answer-row">
                      <span className="answer-label">Correct Answer:</span>
                      <span className="answer-value txt-correct">{q.correct_answer}</span>
                    </div>
                  )}
                </div>

                {q.explanation && (
                  <div className="explanation-box">
                    <span className="explanation-title">Explanation:</span>
                    <p className="explanation-text">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Result;
