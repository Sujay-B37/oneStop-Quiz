import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService.js';
import ProfileView from './ProfileView.jsx';
import SettingsView from './SettingsView.jsx';
import ActivityView from './ActivityView.jsx';
import LeaderboardView from './LeaderboardView.jsx';
import './Dashboard.css';

const Dashboard = ({ user, onSelectQuiz, onLogout, onUpdateUsername }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editUsernameVal, setEditUsernameVal] = useState(user.username || 'Quizzer');
  const [usernameError, setUsernameError] = useState('');

  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    highScore: 0,
    history: []
  });

  // Fetch subjects list on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const list = await apiService.getSubjects();
        setSubjects(list);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch user score history when user session changes or when user selects activity/profile tabs
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const historyList = await apiService.getResults();
        
        // Map REST records: subject, score, total, percentage, date
        const formattedHistory = historyList.map((r, idx) => ({
          id: idx,
          subject: r.subject,
          score: r.score,
          totalQuestions: r.total,
          date: r.date || new Date().toISOString().split('T')[0]
        }));

        let totalScore = 0;
        let highest = 0;
        formattedHistory.forEach((r) => {
          totalScore += Math.round((r.score / r.totalQuestions) * 100);
          if (r.score > highest) highest = r.score;
        });

        const avg = formattedHistory.length > 0 ? Math.round(totalScore / formattedHistory.length) : 0;

        setStats({
          totalQuizzesTaken: formattedHistory.length,
          averageScore: avg,
          highScore: highest,
          history: formattedHistory
        });
      } catch (err) {
        console.error('Error fetching quiz history:', err);
      }
    };
    fetchResults();
  }, [user, activeTab]);

  useEffect(() => {
    setEditUsernameVal(user.username || 'Quizzer');
  }, [user.username]);

  const handleSaveUsername = () => {
    if (!editUsernameVal.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }
    onUpdateUsername(editUsernameVal.trim());
    setIsEditingUsername(false);
    setUsernameError('');
  };

  // Loads syllabus (topics list) dynamically when clicking a subject box
  const handleSelectSubjectCard = async (sub) => {
    setLoadingDetail(true);
    try {
      const quizData = await apiService.getQuiz(sub.id);
      
      // Extract unique topic names from the questions list
      const extractedTopics = [...new Set(quizData.questions.map((q) => q.topic || 'General Core Principles'))];
      
      setSelectedSubject({
        id: sub.id,
        subject: sub.name,
        topics: extractedTopics.length > 0 ? extractedTopics : ['Foundational Concepts']
      });
    } catch (err) {
      console.error('Failed to load subject topics:', err);
      alert('Failed to retrieve quiz topics.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStartQuiz = () => {
    if (selectedSubject) {
      onSelectQuiz(selectedSubject.id);
    }
  };

  // Helper to map subject keys to icons and class styles
  const getSubjectStyle = (id) => {
    const key = id.toLowerCase();
    if (key === 'math') {
      return { className: 'mat-theme', label: 'Mathematics' };
    } else if (key === 'physics') {
      return { className: 'phy-theme', label: 'Physics' };
    } else if (key === 'chemistry') {
      return { className: 'chm-theme', label: 'Chemistry' };
    } else if (key === 'dbms') {
      return { className: 'mat-theme', label: 'Database Systems' };
    } else if (key === 'os') {
      return { className: 'phy-theme', label: 'Operating Systems' };
    } else if (key === 'cn') {
      return { className: 'chm-theme', label: 'Computer Networks' };
    }
    return { className: 'mat-theme', label: 'General Knowledge' }; // fallback
  };

  // Renders the specific SVG icon per subject id
  const renderSubjectIcon = (id) => {
    const key = id.toLowerCase();
    if (key === 'math') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
      );
    } else if (key === 'physics') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4 15.3 15.3 0 0 1-10 4 15.3 15.3 0 0 1-10-4z"/>
        </svg>
      );
    } else if (key === 'chemistry') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
          <path d="M6 3h12"/>
          <path d="M18 3v3L10 18H6L14 6V3"/>
          <path d="M10 18a4 4 0 1 0 8 0v-3l-8 3z"/>
        </svg>
      );
    } else if (key === 'dbms') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
        </svg>
      );
    } else if (key === 'os') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      );
    } else if (key === 'cn') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
          <rect x="16" y="16" width="6" height="6" rx="1"/>
          <rect x="2" y="16" width="6" height="6" rx="1"/>
          <rect x="9" y="2" width="6" height="6" rx="1"/>
          <path d="M12 8v8"/>
          <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
        </svg>
      );
    }
    // Generic Book SVG icon
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Panel */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-nav">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedSubject(null); }}
            className={`sidebar-link ${activeTab === 'dashboard' ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-icon">📚</span> Choose Subject
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`sidebar-link ${activeTab === 'activity' ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-icon">📊</span> Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`sidebar-link ${activeTab === 'leaderboard' ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-icon">🏆</span> Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`sidebar-link ${activeTab === 'profile' ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-icon">👤</span> Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`sidebar-link ${activeTab === 'settings' ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-icon">⚙️</span> Settings
          </button>
        </div>
        <div className="sidebar-footer">
          <button onClick={onLogout} className="sidebar-logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="dashboard-content-panel">
        
        {/* Dynamic header and Inline Edit Username */}
        <div className="content-header-wrapper">
          <div className="greeting-edit-block">
            {isEditingUsername ? (
              <div className="inline-edit-username">
                <span className="greeting-label">Hi, </span>
                <input
                  type="text"
                  value={editUsernameVal}
                  onChange={(e) => setEditUsernameVal(e.target.value)}
                  maxLength={20}
                  className="edit-username-input"
                  placeholder="Enter username"
                  autoFocus
                />
                <button onClick={handleSaveUsername} className="save-btn">✓</button>
                <button onClick={() => { setIsEditingUsername(false); setUsernameError(''); }} className="cancel-btn">✗</button>
                {usernameError && <span className="field-error">{usernameError}</span>}
              </div>
            ) : (
              <div className="greeting-display">
                <h2>Hi, <span className="highlight-username">{user.username || 'Quizzer'}</span></h2>
                <button onClick={() => setIsEditingUsername(true)} className="edit-pencil-btn" title="Edit Username">
                  ✏️
                </button>
              </div>
            )}
            <p className="subtitle-greeting">Ready to test your skills?</p>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="tab-viewport">
          
          {activeTab === 'dashboard' && (
            <div className="subject-selection-container">
              {loadingSubjects && <div className="spinner"></div>}
              
              {!loadingSubjects && !selectedSubject && (
                <div className="subjects-flow">
                  <h3>Choose Subject</h3>
                  <div className="subjects-grid">
                    {subjects.length === 0 ? (
                      <p className="no-quizzes">Loading subjects...</p>
                    ) : (
                      subjects.map((sub) => {
                        const styleInfo = getSubjectStyle(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSelectSubjectCard(sub)}
                            className={`subject-box ${styleInfo.className}`}
                          >
                            <div className="subject-icon-circle">
                              {renderSubjectIcon(sub.id)}
                            </div>
                            <h4>{sub.name}</h4>
                            <p>Test your knowledge in {sub.name}</p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {loadingDetail && (
                <div className="subject-topics-detail-card loading-detail-card">
                  <div className="spinner"></div>
                  <p>Retrieving syllabus and topic lists...</p>
                </div>
              )}

              {!loadingDetail && selectedSubject && (
                <div className="subject-topics-detail-card">
                  <div className="detail-header-row">
                    <button onClick={() => setSelectedSubject(null)} className="back-subjects-btn">
                      &larr; Back to Subjects
                    </button>
                    <span className="quiz-length-badge">10 Questions Quiz</span>
                  </div>

                  <h3 className="selected-subject-title">{selectedSubject.subject} Syllabus</h3>
                  
                  <div className="topics-listing">
                    <span className="topics-list-lbl">Topics Covered:</span>
                    <ul className="topics-list">
                      {selectedSubject.topics.map((topic, i) => (
                        <li key={i} className="topic-item">
                          <span className="topic-bullet">•</span> {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="quiz-start-cta">
                    <p className="cta-note">
                      Note: Starting this quiz will pick 10 random questions from the subject pool.
                    </p>
                    <button onClick={handleStartQuiz} className="auth-button run-quiz-btn">
                      Start Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && <ActivityView stats={stats} />}

          {activeTab === 'leaderboard' && <LeaderboardView currentUser={user} />}

          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              stats={stats}
              onUpdateUsername={onUpdateUsername}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}

        </div>
      </section>
    </div>
  );
};

export default Dashboard;
