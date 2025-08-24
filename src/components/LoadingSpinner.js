import React from 'react';
import BottomNavbar from './BottomNavbar';

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexDirection: 'column'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #1e5bbf',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
      }}></div>
      <div style={{
        color: '#1e293b',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        Chajman...
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <BottomNavbar />
    </div>
  );
}

export default LoadingSpinner;
