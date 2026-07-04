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
    </div>
  );
};

export default SettingsView;
