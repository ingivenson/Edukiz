import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./UserContext";

// Import all pages
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Universites from "./pages/Universites";
import AjouteUniversite from "./pages/AjouteUniversite";
import AjouteMatiere from "./pages/AjouteMatiere";
import MatieresUniversite from "./pages/MatieresUniversite";
import ExamensMatiere from './pages/ExamensMatiere';
import AjouteExamen from "./pages/AjouteExamen";
import QuizListMatiere from "./pages/QuizListMatiere";
import FeQuiz from "./pages/FèQuiz";
import HistorikQuiz from "./pages/HistorikQuiz";
import EtidyeEgzamen from "./pages/EtidyeEgzamen";

// Import Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";



// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚨</h1>
            <h2 style={{ marginBottom: '15px' }}>Gen yon erè ki rive!</h2>
            <p style={{ marginBottom: '20px', opacity: 0.8 }}>
              Yon bagay pa mache kòrèkteman. Tanpri refresh paj la.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Paj la
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 404 Not Found Component
const NotFound = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    color: '#fff',
    padding: '20px',
    textAlign: 'center'
  }}>
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '40px',
      backdropFilter: 'blur(10px)',
      maxWidth: '500px'
    }}>
      <h1 style={{ fontSize: '72px', marginBottom: '20px' }}>404</h1>
      <h2 style={{ marginBottom: '15px' }}>Paj la pa jwenn</h2>
      <p style={{ marginBottom: '30px', opacity: 0.8 }}>
        Paj ou ap chèche a pa egziste oswa li deplase.
      </p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Tounen
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🏠 Akèy
        </button>
      </div>
    </div>
  </div>
);

function App() {
  console.log('🚀 App: Starting EduKiz Ayiti...');

  return (
    <ErrorBoundary>
      <UserProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/accueil" element={<Navigate to="/" replace />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main App Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/universites" element={<Universites />} />
            <Route path="/historik" element={<HistorikQuiz />} />
            <Route path="/results" element={<Navigate to="/historik" replace />} />
            

            
            {/* University & Subject Routes */}
            <Route 
              path="/universites/:id/matieres" 
              element={<MatieresUniversite />} 
            />
            <Route 
              path="/universites/:universiteId/matieres/:matiereId/examens" 
              element={<ExamensMatiere />} 
            />
            <Route 
              path="/universites/:universiteId/matieres/:matiereId/quiz-list" 
              element={<QuizListMatiere />} 
            />
            <Route 
              path="/universites/:universiteId/matieres/:matiereId/quiz/:quizId" 
              element={<FeQuiz />} 
            />
            <Route 
              path="/universites/:universiteId/matieres/:matiereId/egzamen/:quizId/etidye" 
              element={<EtidyeEgzamen />} 
            />
            
            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<Navigate to="/admin-login" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin-dashboard" replace />} />
            <Route path="/admin/ajoute-universite" element={<AjouteUniversite />} />
            <Route path="/admin/ajoute-matiere" element={<AjouteMatiere />} />
            <Route path="/ajoute-examen" element={<AjouteExamen />} />
            
            {/* Legacy/Alternative Routes - Redirects */}
            <Route path="/quiz" element={<Navigate to="/universites" replace />} />
            <Route path="/fe-quiz" element={<Navigate to="/universites" replace />} />
            <Route path="/historik-quiz" element={<Navigate to="/historik" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;