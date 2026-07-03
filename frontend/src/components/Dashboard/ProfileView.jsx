import React, { useState } from 'react';

const ProfileView = ({ user, stats, onUpdateUsername }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.username || 'Quizzer');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!editName.trim()) {
      setError('Username cannot be empty');
      return;
    }
    onUpdateUsername(editName.trim());
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="profile-view-container">
      <div className="profile-header-card">
        <div className="profile-avatar">
          {(user.username || 'Q')[0].toUpperCase()}
        </div>
        <div className="profile-title-info">
          {isEditing ? (
            <div className="inline-edit-username">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={20}
                className="edit-name-input"
              />
              <button onClick={handleSave} className="save-name-btn">Save</button>
              <button onClick={() => { setIsEditing(false); setError(''); }} className="cancel-name-btn">Cancel</button>
              {error && <p className="field-error">{error}</p>}
            </div>
          ) : (
            <div className="display-username-wrapper">
              <h3>{user.username || 'Quizzer'}</h3>
              <button onClick={() => setIsEditing(true)} className="edit-pencil-btn" title="Edit Username">
                ✏️
              </button>
            </div>
          )}
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-stats-card">
        <h4>Performance Summary</h4>
        <div className="profile-stats-grid">
          <div className="p-stat-box">
            <span className="p-stat-num">{stats.totalQuizzesTaken}</span>
            <span className="p-stat-lbl">Quizzes Taken</span>
          </div>
          <div className="p-stat-box">
            <span className="p-stat-num">{stats.averageScore}%</span>
            <span className="p-stat-lbl">Avg. Score</span>
          </div>
          <div className="p-stat-box">
            <span className="p-stat-num">{stats.highScore}/10</span>
            <span className="p-stat-lbl">High Score</span>
          </div>
        </div>
      </div>

      <div className="account-details-card">
        <h4>Account Information</h4>
        <div className="details-list">
          <div className="detail-item">
            <span className="detail-lbl">User Role</span>
            <span className="detail-val">Student</span>
          </div>
          <div className="detail-item">
            <span className="detail-lbl">AWS Platform</span>
            <span className="detail-val">Cognito Verified</span>
          </div>
          <div className="detail-item">
            <span className="detail-lbl">Account Status</span>
            <span className="detail-val text-green">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
