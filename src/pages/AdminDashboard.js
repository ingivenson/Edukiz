import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../css/AdminDashboard.css';

function AdminDashboard() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    activeUsers: 0
  });

  // Chèche si se admin ki konekte
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/admin-login', { replace: true });
      return;
    }

    // Load admin stats
    loadAdminStats();
  }, [user, navigate]);

  const loadAdminStats = () => {
    try {
      // Count users from localStorage
      let totalUsers = 0;
      let totalQuizzes = 0;
      
      // Chèche nan localStorage pou konte itilizatè yo
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quiz_history_')) {
          totalUsers++;
          const history = JSON.parse(localStorage.getItem(key) || '[]');
          totalQuizzes += history.length;
        }
      }

      // Estime total questions (average 10 questions per quiz)
      const totalQuestions = totalQuizzes * 10;
      
      // Active users (users who did quiz in last 7 days)
      const activeUsers = Math.floor(totalUsers * 0.3); // Estimate

      setStats({
        totalUsers,
        totalQuizzes,
        totalQuestions,
        activeUsers
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setUser(null);
    navigate('/admin-login', { replace: true });
  };

  const clearAllData = () => {
    if (window.confirm('Ou vle efase tout done yo? Sa pa ka defèt!')) {
      if (window.confirm('Ou kwè w? Tout kiz ak done itilizatè yo ap disparèt!')) {
        // Clear all quiz history
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('quiz_history_')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Reload stats
        loadAdminStats();
        
        alert('Tout done yo efase!');
      }
    }
  };

  const exportData = () => {
    try {
      const allData = {};
      
      // Export all quiz histories
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quiz_history_')) {
          allData[key] = JSON.parse(localStorage.getItem(key) || '[]');
        }
      }
      
      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `edukiz_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      alert('Done yo ekspòte ak siksè!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erè nan ekspòtasyon done yo');
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">⏳</div>
        <p>Kap verifye otorizasyon...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-branding">
            <div className="admin-logo">
              <span className="logo-icon">👨‍💼</span>
              <div>
                <h1 className="admin-title">Admin Dashboard</h1>
                <p className="admin-subtitle">EduKiz Ayiti</p>
              </div>
            </div>
          </div>
          
          <div className="admin-user-info">
            <div className="user-details">
              <span className="user-name">{user.displayName}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">🚪</span>
              Soti
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="admin-stats-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Estatistik Sistèm nan
        </h2>
        
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon users">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Total Itilizatè</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon quizzes">📝</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalQuizzes}</div>
              <div className="stat-label">Total Kiz</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon questions">❓</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalQuestions}</div>
              <div className="stat-label">Total Kesyon</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon active">⚡</div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeUsers}</div>
              <div className="stat-label">Itilizatè Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Actions */}
      <section className="admin-actions-section">
        <h2 className="section-title">
          <span className="section-icon">🛠️</span>
          Aksyon Admin
        </h2>
        
        <div className="admin-actions-grid">
          <button onClick={loadAdminStats} className="admin-action-card refresh">
            <div className="action-icon">🔄</div>
            <div className="action-content">
              <h3 className="action-title">Refresh Done</h3>
              <p className="action-desc">Mete estatistik yo ajou</p>
            </div>
          </button>
          
          <button onClick={() => {
            if (window.confirm('Ou vle preranpli kesyon konesans jeneral yo?')) {
              const script = document.createElement('script');
              script.src = '/efase_preranpli_qcm_konesans_jeneral.js';
              document.body.appendChild(script);
              script.onload = () => {
                alert('Kesyon yo preranpli ak siksè!');
                loadAdminStats();
              };
              script.onerror = () => {
                alert('Gen yon erè ki fèt pandan preranplisman an');
              };
            }
          }} className="admin-action-card">
            <div className="action-icon">📚</div>
            <div className="action-content">
              <h3 className="action-title">Preranpli Konesans Jeneral</h3>
              <p className="action-desc">Ajoute kesyon konesans jeneral yo</p>
            </div>
          </button>
          
          <button onClick={exportData} className="admin-action-card export">
            <div className="action-icon">📤</div>
            <div className="action-content">
              <h3 className="action-title">Ekspòte Done</h3>
              <p className="action-desc">Telechaje tout done yo</p>
            </div>
          </button>
          
          <button onClick={clearAllData} className="admin-action-card danger">
            <div className="action-icon">🗑️</div>
            <div className="action-content">
              <h3 className="action-title">Efase Tout Done</h3>
              <p className="action-desc">Atansyon: Sa pa ka defèt!</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/ajoute-examen')} 
            className="admin-action-card primary"
          >
            <div className="action-icon">➕</div>
            <div className="action-content">
              <h3 className="action-title">Ajoute Kesyon</h3>
              <p className="action-desc">Kreye nouvo kesyon</p>
            </div>
          </button>
        </div>
      </section>

      {/* System Info */}
      <section className="admin-info-section">
        <h2 className="section-title">
          <span className="section-icon">ℹ️</span>
          Enfòmasyon Sistèm
        </h2>
        
        <div className="info-cards-grid">
          <div className="info-card">
            <h3 className="info-title">
              <span className="info-icon">🔐</span>
              Sekirite
            </h3>
            <ul className="info-list">
              <li>Admin session aktif</li>
              <li>Done yo nan localStorage</li>
              <li>Otentifikasyon obligatwa</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3 className="info-title">
              <span className="info-icon">💾</span>
              Depo Done
            </h3>
            <ul className="info-list">
              <li>LocalStorage pou done yo</li>
              <li>JSON format</li>
              <li>Ekspòtasyon disponib</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3 className="info-title">
              <span className="info-icon">🚀</span>
              Pèfòmans
            </h3>
            <ul className="info-list">
              <li>React frontend</li>
              <li>Responsive design</li>
              <li>PWA ready</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="admin-footer">
        <div className="footer-content">
          <p className="footer-text">
            <span className="footer-icon">🇭🇹</span>
            EduKiz Ayiti - Panel Administratè
          </p>
          <p className="developer-credit">
            Devlope ak ❤️ pa <strong>Ing. Ivenson Petit-Homme</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;