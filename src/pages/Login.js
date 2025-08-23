 import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Admin emails (ou ka mete sa nan environment variables pou pi bon sekirite)
  const getAdminEmails = () => {
    // Ou ka chanje sa nan .env file pou pi bon sekirite
    return [
      process.env.REACT_APP_ADMIN_EMAIL_1 || 'admin@edukiz.com',
      process.env.REACT_APP_ADMIN_EMAIL_2 || 'ivenson@edukiz.com'
    ];
  };

  // Fonksyon pou verifye si se admin (pa ekspoz email yo nan console)
  const isAdmin = (userEmail) => {
    const adminEmails = getAdminEmails();
    return adminEmails.includes(userEmail.toLowerCase());
  };

  // Fonksyon pou redirect selon role user la
  const redirectUser = (user) => {
    if (isAdmin(user.email)) {
      // Pa ekspoz admin email nan console pou sekirite
      console.log('👨‍💼 Admin access granted');
      navigate('/admin/ajoute-universite');
    } else {
      console.log('👤 User access granted');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Login successful');
      
      // Redirect selon role user la
      redirectUser(user);
      
    } catch (err) {
      console.error('❌ Login error:', err.code);
      
      if (err.code === 'auth/user-not-found') {
        setError('Kont sa a pa egziste. Verifye imèl ou a.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Modpas la pa kòrèk.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Imèl la pa valid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Twòp tantativ echwe. Tann yon ti kras epi eseye ankò.');
      } else if (err.code === 'auth/user-disabled') {
        setError('Kont sa a bloke. Kontakte administratè a.');
      } else {
        setError('Koneksyon echwe. Tanpri tcheke enfòmasyon yo.');
      }
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setGoogleLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      console.log('✅ Google login successful');
      
      // Redirect selon role user la
      redirectUser(user);
      
    } catch (err) {
      console.error('❌ Google login error:', err.code);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Koneksyon ak Google anile.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup bloke. Tanpri otorize popup yo nan browser ou a.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Kont sa a deja egziste ak yon lòt metòd koneksyon.');
      } else {
        setError('Koneksyon ak Google echwe. Eseye ankò.');
      }
    }
    
    setGoogleLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a2a5c 0%, #1e5bbf 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '2rem',
        padding: '2rem 1.5rem',
        maxWidth: 350,
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#1e5bbf',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            fontSize: '24px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            K
          </div>
        </div>
        
        <h2 style={{
          color: '#1e5bbf',
          textAlign: 'center',
          marginBottom: 16,
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          Konekte ak Kont Ou
        </h2>
        
        {/* Info message general (pa ekspoz admin info) */}
        <div style={{
          background: '#e8f4fd',
          border: '1px solid #bee5eb',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#0c5460'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            ℹ️ Enfòmasyon:
          </div>
          <div>
            Apre koneksyon, ou pral dirije nan paj ki apwopriye pou kont ou a.
          </div>
        </div>
        
        {error && (
          <div style={{
            color: '#e74c3c',
            marginBottom: 16,
            textAlign: 'center',
            padding: '12px',
            background: '#fdf2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12, position: 'relative' }}>
            <input
              type="email"
              placeholder="Imèl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                borderRadius: 8,
                border: '1px solid #ccc',
                fontSize: 16,
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1e5bbf'}
              onBlur={(e) => e.target.style.borderColor = '#ccc'}
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontSize: '18px'
            }}>
              📧
            </span>
          </div>
          
          <div style={{ marginBottom: 12, position: 'relative' }}>
            <input
              type="password"
              placeholder="Modpas"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                borderRadius: 8,
                border: '1px solid #ccc',
                fontSize: 16,
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1e5bbf'}
              onBlur={(e) => e.target.style.borderColor = '#ccc'}
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontSize: '18px'
            }}>
              🔒
            </span>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#c0392b' : '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              transform: loading ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {loading ? '⏳ Ap konekte...' : '🔐 KONEKTE'}
          </button>
        </form>
        
        <div style={{
          textAlign: 'center',
          margin: '16px 0',
          color: '#888',
          fontSize: '14px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: '#ddd'
          }}></div>
          <span style={{
            background: '#fff',
            padding: '0 15px',
            fontWeight: '600'
          }}>
            OSWA
          </span>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: '100%',
            background: '#fff',
            color: '#444',
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: '12px 0',
            fontWeight: 600,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            transform: googleLoading ? 'scale(0.98)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (!googleLoading) {
              e.target.style.background = '#f8f9fa';
              e.target.style.borderColor = '#1e5bbf';
            }
          }}
          onMouseLeave={(e) => {
            if (!googleLoading) {
              e.target.style.background = '#fff';
              e.target.style.borderColor = '#ccc';
            }
          }}
        >
          <span style={{
            fontSize: '18px',
            color: '#4285f4',
            fontWeight: 'bold'
          }}>
            G
          </span>
          {googleLoading ? '⏳ Ap verifye...' : '🔐 Konekte ak Google'}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Ou poko gen kont? 
          </span>
          <Link to="/register" style={{
            color: '#1e5bbf',
            fontWeight: 600,
            textDecoration: 'none',
            marginLeft: '4px'
          }}>
            Klike isit pou kreye youn.
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;