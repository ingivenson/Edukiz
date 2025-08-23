import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import BottomNavbar from '../components/BottomNavbar';
import '../css/Dashboard.css';
import '../css/Dashboard_white_bg.css';

function Dashboard() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    bestSubject: '',
    timeSpent: '0min'
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatTime = useCallback((minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
  }, []);

  const formatDate = useCallback((date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Jodi a';
    } else if (diffDays === 2) {
      return 'Yè';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} jou pase`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} semèn pase`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} mwa pase`;
    }
  }, []);

  // Fonksyon amelyore pou jwenn non inivèsite ak matyè depi quizName
  const parseQuizInfo = useCallback((entry) => {
    // Si gen university ak subject deja nan entry, itilize yo
    if (entry.university && entry.subject) {
      return {
        university: entry.university,
        subject: entry.subject
      };
    }
    
    const quizName = entry.quizName || entry.name || '';
    
    if (!quizName) return { university: 'Inivèsite', subject: 'Matyè' };
    
    // Eseye separe ak separators yo
    const separators = [' - ', ' : ', ': ', ' | ', '|', ' / ', '/', ' → ', ' -> '];
    
    for (const separator of separators) {
      if (quizName.includes(separator)) {
        const parts = quizName.split(separator);
        if (parts.length >= 2) {
          return {
            university: parts[0].trim(),
            subject: parts.slice(1).join(separator).trim()
          };
        }
      }
    }
    
    // Chèche inivèsite yo nan kòmanseman ak nan mitan
    const universityPatterns = [
      'UEH', 'CHCL', 'FEL', 'FAMV', 'UPNCH', 'UNIQ', 'CTPEA', 
      'UNIBANK', 'UNIFA', 'ESIH', 'INUQUA', 'UNEPH', 'UNDH',
      'Université d\'État d\'Haïti', 'Centre Hospitalier', 
      'Faculté d\'Ethnologie', 'Faculté d\'Agronomie'
    ];
    
    for (const pattern of universityPatterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      if (regex.test(quizName)) {
        const subject = quizName.replace(regex, '').trim();
        // Retire separators ki rete
        const cleanSubject = subject.replace(/^[-:|/→>]+|[-:|/→>]+$/g, '').trim();
        return {
          university: pattern.toUpperCase(),
          subject: cleanSubject || 'Matyè'
        };
      }
    }
    
    // Eseye ak mo yo - premye mo kòm inivèsite
    const words = quizName.trim().split(/\s+/);
    if (words.length >= 2) {
      // Si premye mo gen 3-6 lèt ak gen majiskil, li ka yon inivèsite
      const firstWord = words[0];
      if (firstWord.length >= 2 && firstWord.length <= 8 && /[A-Z]/.test(firstWord)) {
        return {
          university: firstWord.toUpperCase(),
          subject: words.slice(1).join(' ')
        };
      }
    }
    
    // Fallback - itilize tout bagay kòm subject
    return { 
      university: 'Inivèsite', 
      subject: quizName 
    };
  }, []);

  const getQuizHistory = useCallback(() => {
    if (!user) return [];
    
    const userKey = `quiz_history_${user.uid}`;
    const history = JSON.parse(localStorage.getItem(userKey) || "[]");
    
    // Konvèti dat yo nan Date objects ak parse quiz info
    return history.map((entry, index) => {
      const quizInfo = parseQuizInfo(entry);
      const processedEntry = {
        ...entry,
        dateObj: new Date(entry.date),
        university: quizInfo.university,
        subject: quizInfo.subject,
        id: entry.id || `quiz_${index}_${Date.now()}`
      };
      
      return processedEntry;
    });
  }, [user, parseQuizInfo]);

  const calculateStats = useCallback((history) => {
    if (history.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        bestSubject: '',
        timeSpent: '0min'
      };
    }

    let totalScore = 0;
    let bestScore = 0;
    let bestSubject = '';
    let totalTimeSpent = 0;

    history.forEach((entry) => {
      // Kalkile pousan nòt la
      const percentage = entry.total > 0 ? Math.round((entry.score / entry.total) * 100) : 0;
      totalScore += percentage;
      
      // Jwenn pi bon nòt ak matyè li
      if (percentage > bestScore) {
        bestScore = percentage;
        bestSubject = entry.subject || entry.quizName || 'Kiz';
      }
      
      // Estime tan yo pase (5 minit pa kiz kòm default)
      totalTimeSpent += entry.timeSpent || 5;
    });

    const averageScore = Math.round(totalScore / history.length);
    const timeSpentFormatted = formatTime(totalTimeSpent);

    return {
      totalQuizzes: history.length,
      averageScore,
      bestScore,
      bestSubject,
      timeSpent: timeSpentFormatted
    };
  }, [formatTime]);

  const getRecentActivities = useCallback((history) => {
    // Òganize pa dat (pi resan yo anwo) ak pran 5 yo
    const sortedHistory = [...history]
      .sort((a, b) => b.dateObj - a.dateObj)
      .slice(0, 5);

    return sortedHistory.map((entry, index) => ({
      id: entry.id || `activity_${index}`,
      university: entry.university || 'Inivèsite',
      subject: entry.subject || 'Matyè',
      score: entry.total > 0 ? Math.round((entry.score / entry.total) * 100) : 0,
      date: formatDate(entry.dateObj),
      completedAt: entry.dateObj,
      questionsTotal: entry.total || 0,
      correctAnswers: entry.score || 0,
      quizName: entry.quizName || 'Kiz'
    }));
  }, [formatDate]);

  const loadData = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const history = getQuizHistory();
      const calculatedStats = calculateStats(history);
      const recentActivitiesData = getRecentActivities(history);
      
      setStats(calculatedStats);
      setRecentActivities(recentActivitiesData);
    } catch (error) {
      console.error('Erè nan chèche done yo:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getQuizHistory, calculateStats, getRecentActivities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Refresh otomatik lè component la mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh lè ou retounen sou dashboard la
  useEffect(() => {
    if (location.pathname === '/dashboard' && user) {
      const timer = setTimeout(() => {
        loadData();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, user, loadData]);

  // Refresh lè window la vin visible ankò
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/dashboard' && user) {
        loadData();
      }
    };

    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('quiz_history_') && user) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname, user, loadData]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Kap chèche done ou yo...</p>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              <span className="title-icon">🎓</span>
              Dashboard Ou
            </h1>
            {user && (
              <p className="welcome-text">
                Byenvini, <strong>{user.displayName || user.email?.split('@')[0]}</strong>!
              </p>
            )}
          </div>
          <div className="header-actions">
            <button 
              onClick={handleRefresh} 
              className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
              disabled={refreshing}
              title="Refresh done yo"
            >
              <span className="refresh-icon">🔄</span>
            </button>
            <div className="header-badge">
              <span className="badge-icon">🇭🇹</span>
              <span className="badge-text">EduKiz Ayiti</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Estatistik Ou
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalQuizzes}</div>
              <div className="stat-label">Kiz Fèt</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">{stats.averageScore}%</div>
              <div className="stat-label">Mwayèn</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-number">{stats.bestScore}%</div>
              <div className="stat-label">
                Pi Bon Nòt
                {stats.bestSubject && (
                  <div className="stat-sublabel">nan {stats.bestSubject}</div>
                )}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{stats.timeSpent}</div>
              <div className="stat-label">Tan Pase</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Ak Link yo sèlman */}
      <section className="actions-section">
        <h2 className="section-title">
          <span className="section-icon">🚀</span>
          Aksyon Rapid
        </h2>
        <div className="actions-grid">
          <Link to="/universites" className="action-card">
            <div className="action-icon">🏛️</div>
            <div className="action-content">
              <h3 className="action-title">Inivèsite yo</h3>
              <p className="action-desc">Chwazi inivèsite ak matyè ou vle pratike</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          {/* KÒRIJE: Itilize Link senp olye bouton */}
          <Link to="/historik" className="action-card">
            <div className="action-icon">📈</div>
            <div className="action-content">
              <h3 className="action-title">Istorik Kiz</h3>
              <p className="action-desc">Wè tout rezilta ak pèfòmans ou yo</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>
        </div>
      </section>

      {/* Recent Activity - Sèlman si gen kiz ki fèt */}
      {stats.totalQuizzes > 0 && (
        <section className="activity-section">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            5 Dènye Kiz Ou Yo
          </h2>
          <div className="activity-container">
            {recentActivities.length > 0 ? (
              <div className="activity-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">🎯</div>
                    <div className="activity-content">
                      <div className="activity-main">
                        <span className="activity-university">{activity.university}</span>
                        <span className="activity-separator">•</span>
                        <span className="activity-subject">{activity.subject}</span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-score">{activity.score}%</span>
                        <span className="activity-details">
                          {activity.correctAnswers}/{activity.questionsTotal} kòrèk
                        </span>
                        <span className="activity-date">{activity.date}</span>
                      </div>
                    </div>
                    <div className={`activity-badge ${activity.score >= 80 ? 'success' : activity.score >= 60 ? 'warning' : 'danger'}`}>
                      {activity.score >= 80 ? '✅' : activity.score >= 60 ? '⚠️' : '❌'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3 className="empty-title">Pa gen kiz ankò</h3>
                <p className="empty-desc">Kòmanse fè kiz yo pou wè rezilta ou yo isit la</p>
                <Link to="/universites" className="empty-cta">
                  Kòmanse Kounye a
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State pou nouvo itilizatè */}
      {stats.totalQuizzes === 0 && (
        <section className="welcome-section-new">
          <div className="welcome-card">
            <div className="welcome-icon">🎯</div>
            <h3 className="welcome-title">Byenvini nan EduKiz Ayiti!</h3>
            <p className="welcome-desc">
              Ou pa fè okenn kiz ankò. Kòmanse pratike ak vre kesyon egzamen yo pou prepare w pou inivèsite yo.
            </p>
            <Link to="/universites" className="welcome-cta">
              <span className="cta-icon">🚀</span>
              Fè Premye Kiz Ou
            </Link>
          </div>
        </section>
      )}

      {/* Motivation Section - Sèlman si gen kiz ki fèt */}
      {stats.totalQuizzes > 0 && (
        <section className="motivation-section">
          <div className="motivation-card">
            <div className="motivation-icon">💪</div>
            <div className="motivation-content">
              <h3 className="motivation-title">
                {stats.averageScore >= 80 ? 'Ekselan travay!' : 
                 stats.averageScore >= 60 ? 'Bon pèfòmans!' : 
                 'Kontinye ap travay!'}
              </h3>
              <p className="motivation-text">
                {stats.averageScore >= 80 ? 
                  `Ou gen yon mwayèn ${stats.averageScore}% ak pi bon nòt ou se ${stats.bestScore}% nan ${stats.bestSubject}. Kontinye konsa!` :
                  stats.averageScore >= 60 ?
                  `Ou sou bon chemen an ak ${stats.averageScore}% mwayèn. Kontinye pratike pou rive nan 80%+!` :
                  `Ou gen ${stats.totalQuizzes} kiz deja. Chak kiz ou fè se yon pa pi pre nan objektif ou!`}
              </p>
            </div>
            <div className="motivation-badge">
              <span className="streak-number">{stats.totalQuizzes}</span>
              <span className="streak-label">kiz</span>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default Dashboard;