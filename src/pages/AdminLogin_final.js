import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../css/AdminLogin.css';

function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Kont admin yo ak email yo (ou ka chanje yo isit la)
  const ADMIN_ACCOUNTS = [
    {
      username: 'admin',
      password: 'EduKiz2024!',
      email: 'admin@edukiz.com',
      displayName: 'Administratè Prensipal',
      role: 'super_admin'
    },
    {
      username: 'ivenson',
      password: 'IvensonAdmin123!',
      email: 'IvensonAdmin@edukiz.com',
      displayName: 'Ing. Ivenson Petit-Homme',
      role: 'developer'
    },
    {
      username: 'edukiz_admin',
      password: 'Ayiti2024Admin!',
      email: 'support@edukiz.com',
      displayName: 'EduKiz Admin',
      role: 'admin'
    },
    {
      username: 'manager',
      password: 'Manager2024!',
      email: 'manager@edukiz.com',
      displayName: 'EduKiz Manager',
      role: 'manager'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error lè w ap tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Chèche si kont lan egziste
      const adminAccount = ADMIN_ACCOUNTS.find(
        account => account.username === credentials.username && 
                  account.password === credentials.password
      );

      if (adminAccount) {
        // Kreye admin user object ak email
        const adminUser = {
          uid: `admin_${adminAccount.username}`,
          email: adminAccount.email,
          displayName: adminAccount.displayName,
          role: adminAccount.role,
          isAdmin: true,
          loginTime: new Date().toISOString()
        };

        // Save admin session
        localStorage.setItem('admin_session', JSON.stringify(adminUser));
        
        // Set user context
        setUser(adminUser);
        
        // Redirect to admin dashboard
        navigate('/admin-dashboard', { replace: true });
      } else {
        setError('Non itilizatè oswa mot de pas ki pa kòrèk');
      }
    } catch (error) {
      console.error('Erè nan koneksyon admin:', error);
      setError('Yon erè rive. Eseye ankò.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-header">
          <div className="admin-logo">
            <div className="logo-icon">🔐</div>
            <h1 className="admin-title">EduKiz Admin</h1>
          </div>
          <p className="admin-subtitle">Koneksyon Administratè</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <span className="label-icon">👤</span>
              Non Itilizatè
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Antre non itilizatè admin"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-icon">🔑</span>
              Mot de Pas
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Antre mot de pas admin"
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className={`admin-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Kap konekte...
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                Konekte kòm Admin
              </>
            )}
          </button>
        </form>

        <div className="admin-info">
          <div className="info-card">
            <h3 className="info-title">
              <span className="info-icon">👥</span>
              Kont Admin Yo
            </h3>
            <ul className="info-list">
              <li><strong>admin</strong> → admin@edukiz.com</li>
              <li><strong>ivenson</strong> → IvensonAdmin@edukiz.com</li>
              <li><strong>edukiz_admin</strong> → support@edukiz.com</li>
              <li><strong>manager</strong> → manager@edukiz.com</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3 className="info-title">
              <span className="info-icon">🛠️</span>
              Fonksyonalite Admin
            </h3>
            <ul className="info-list">
              <li>Aksè nan jesyon kesyon yo</li>
              <li>Jesyon inivèsite ak matyè yo</li>
              <li>Estatistik ak rapò yo</li>
              <li>Jesyon itilizatè yo</li>
            </ul>
          </div>
        </div>

        <div className="admin-footer">
          <p className="footer-text">
            <span className="footer-icon">🇭🇹</span>
            EduKiz Ayiti - Panel Administratè
          </p>
          <p className="developer-credit">
            Devlope pa <strong>Ing. Ivenson Petit-Homme</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;