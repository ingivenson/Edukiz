 import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkingAuth } = useUser();

  const navItems = [
    {
      id: 'home',
      label: 'Akèy',
      icon: '🏠',
      path: '/', 
      paths: ['/', '/accueil', '/home']
    },
    {
      id: 'quiz',
      label: 'Kiz',
      icon: '📝',
      path: '/universites',
      paths: ['/quiz', '/fe-quiz', '/historik-quiz', '/universites']
    },
    {
      id: 'results',
      label: 'Rezilta',
      icon: '📊',
      path: '/historik',
      paths: ['/historik', '/results']
    },
    {
      id: 'settings',
      label: 'Pwofil',
      icon: '👤',
      path: '/dashboard',
      paths: ['/dashboard', '/settings']
    }
  ];

  const isActive = (item) => {
    return item.paths.some(path => location.pathname === path || location.pathname.startsWith(path));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Si kap chèche user oswa user pa konekte, pa montre navbar
  if (checkingAuth || !user) {
    console.log('🚫 Navbar pa parèt - CheckingAuth:', checkingAuth, 'User:', !!user);
    return null;
  }

  console.log('✅ Navbar ap parèt - User konekte:', user.email || user.uid);

  return (
    <>
      {/* Spacer to prevent content from being hidden behind navbar */}
      <div style={{ height: '80px' }}></div>
      
      {/* Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(15px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        padding: '8px 0',
        height: '80px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          height: '100%',
          padding: '0 16px'
        }}>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? 'rgba(30, 91, 191, 0.1)' : 'transparent',
                  color: active ? '#1e5bbf' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '60px',
                  fontSize: '12px',
                  fontWeight: active ? '600' : '500',
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  outline: 'none',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {/* Icon */}
                <div style={{
                  fontSize: '20px',
                  marginBottom: '4px',
                  filter: active ? 'none' : 'grayscale(0.3)',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}>
                  {item.icon}
                </div>
                
                {/* Label */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: active ? '600' : '500',
                  color: active ? '#1e5bbf' : '#6b7280',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {item.label}
                </span>
                
                {/* Active Indicator */}
                {active && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#1e5bbf',
                    animation: 'pulse 2s infinite'
                  }}></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translateX(-50%) scale(1.2);
          }
        }
        
        /* Mobile responsiveness */
        @media (max-width: 480px) {
          nav {
            padding: 6px 0 !important;
            height: 75px !important;
          }
          
          button {
            padding: 6px 8px !important;
            min-width: 50px !important;
          }
          
          div[style*="fontSize: '20px'"] {
            font-size: 18px !important;
          }
          
          span[style*="fontSize: '11px'"] {
            font-size: 10px !important;
          }
        }
        
        /* Tablet responsiveness */
        @media (min-width: 481px) and (max-width: 768px) {
          nav {
            padding: 10px 0 !important;
            height: 85px !important;
          }
          
          button {
            padding: 10px 16px !important;
            min-width: 70px !important;
          }
        }
        
        /* Desktop hover effects */
        @media (min-width: 769px) {
          button:hover {
            transform: scale(1.05) !important;
          }
          
          button:active {
            transform: scale(0.98) !important;
          }
        }
      `}</style>
    </>
  );
};

export default BottomNavbar;