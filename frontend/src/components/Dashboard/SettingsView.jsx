import React, { useState } from 'react';

const SettingsView = () => {
  const [settings, setSettings] = useState({
    darkTheme: !document.body.classList.contains('light-theme'),
    emailNotifications: false,
  });

  const handleToggle = (key) => {
    if (key === 'darkTheme') {
      const isCurrentlyDark = !document.body.classList.contains('light-theme');
      if (isCurrentlyDark) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    alert('Password change endpoint will trigger an AWS Cognito password reset. (Offline Simulation)');
  };

  return (
    <div className="settings-view-container">
      <h3>Account & Application Settings</h3>

      {/* General Settings */}
      <div className="settings-card">
        <h4>Preferences</h4>
        <div className="toggle-list">
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-title">Dark Theme</span>
              <span className="toggle-desc">Enable high-contrast slate-dark color mode.</span>
            </div>
            <button
              onClick={() => handleToggle('darkTheme')}
              className={`toggle-switch ${settings.darkTheme ? 'active' : ''}`}
            >
              {settings.darkTheme ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-title">Email Notifications</span>
              <span className="toggle-desc">Receive notifications upon completing quizzes.</span>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
            >
              {settings.emailNotifications ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset */}
      <div className="settings-card">
        <h4>Change Password</h4>
        <form onSubmit={handlePasswordChange} className="password-reset-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input type="password" id="currentPassword" placeholder="••••••••" required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input type="password" id="newPassword" placeholder="••••••••" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password</label>
            <input type="password" id="confirmNewPassword" placeholder="••••••••" required />
          </div>
          <button type="submit" className="auth-button save-settings-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
