import React from 'react';

const ActivityView = ({ stats }) => {
  const records = stats.history || [];

  return (
    <div className="activity-view-container">
      <h3>Recent Quiz Activity</h3>
      <p className="section-intro-desc">Review your quiz attempts, scores, and performance percentages below.</p>

      {records.length === 0 ? (
        <div className="empty-history-state">
          <span className="empty-history-icon">📊</span>
          <p>You haven't completed any quizzes yet.</p>
          <p className="hint-text">Go to the Dashboard tab to select a subject and take your first test!</p>
        </div>
      ) : (
        <div className="activity-timeline-list">
          {records.map((record) => {
            const percentage = Math.round((record.score / record.totalQuestions) * 100);
            
            // Custom status indicators
            let scoreClass = 'score-low';
            let statusText = 'Need Practice';
            if (percentage >= 80) {
              scoreClass = 'score-high';
              statusText = 'Excellent';
            } else if (percentage >= 50) {
              scoreClass = 'score-mid';
              statusText = 'Passed';
            }

            return (
              <div key={record.id} className="activity-item-card">
                <div className="activity-subject-badge">
                  {record.subject}
                </div>
                <div className="activity-details">
                  <div className="activity-top-row">
                    <span className="activity-date">{record.date}</span>
                    <span className={`activity-status ${scoreClass}`}>{statusText}</span>
                  </div>
                  <div className="activity-bottom-row">
                    <span className="activity-points">Score: {record.score}/{record.totalQuestions}</span>
                    <span className="activity-percentage">{percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityView;
