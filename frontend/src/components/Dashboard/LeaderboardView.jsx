import React from 'react';

const LeaderboardView = ({ currentUser }) => {
  const leaders = [
    { rank: 1, name: 'Alice_99', score: 10, subject: 'Physics', date: '2026-07-03' },
    { rank: 2, name: 'Bob_Dev', score: 10, subject: 'Math', date: '2026-07-03' },
    { rank: 3, name: 'Charlie_Quiz', score: 9, subject: 'Chemistry', date: '2026-07-02' },
    { rank: 4, name: currentUser.username || 'Quizzer', score: 8, subject: 'Math', date: '2026-07-02', isCurrentUser: true },
    { rank: 5, name: 'David_K', score: 8, subject: 'Physics', date: '2026-07-01' },
  ];

  return (
    <div className="leaderboard-view-container">
      <h3>Global Leaderboard</h3>
      <p className="section-intro-desc">See how your scores stack up against the top quiz-takers on the platform.</p>

      <div className="leaderboard-card">
        <div className="leaderboard-header-row">
          <span className="lead-rank">Rank</span>
          <span className="lead-name">Username</span>
          <span className="lead-subject">Subject</span>
          <span className="lead-score">High Score</span>
        </div>
        <div className="leaderboard-list">
          {leaders.map((leader, index) => (
            <div
              key={index}
              className={`leaderboard-item-row ${leader.isCurrentUser ? 'lead-row-highlight' : ''}`}
            >
              <span className="lead-rank">
                {leader.rank === 1 && '🥇'}
                {leader.rank === 2 && '🥈'}
                {leader.rank === 3 && '🥉'}
                {leader.rank > 3 && `#${leader.rank}`}
              </span>
              <span className="lead-name">
                {leader.name} {leader.isCurrentUser && <span className="you-label">(You)</span>}
              </span>
              <span className="lead-subject">{leader.subject}</span>
              <span className="lead-score">{leader.score}/10</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
