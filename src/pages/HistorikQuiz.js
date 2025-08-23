import React, { useState, useEffect } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import BottomNavbar from '../components/BottomNavbar';
import '../css/HistorikQuiz.css';

function HistorikQuiz() {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'score', 'name'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'passed', 'failed'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userKey = `quiz_history_${user.uid}`;
      const hist = JSON.parse(localStorage.getItem(userKey) || "[]");
      setHistory(hist);
    }
  }, [user]);

  // Fonksyon pou kalkile pousan
  const calculatePercentage = (score, total) => {
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  // Fonksyon pou filtre ak òganize done yo
  const getFilteredAndSortedHistory = () => {
    let filtered = [...history];

    // Filtre
    if (filterBy === 'passed') {
      filtered = filtered.filter(h => calculatePercentage(h.score, h.total) >= 60);
    } else if (filterBy === 'failed') {
      filtered = filtered.filter(h => calculatePercentage(h.score, h.total) < 60);
    }

    // Òganize
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return calculatePercentage(b.score, b.total) - calculatePercentage(a.score, a.total);
        case 'name':
          return (a.quizName || '').localeCompare(b.quizName || '');
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  };

  // Fonksyon pou formatte dat la
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Jodi a';
    } else if (diffDays === 2) {
      return 'Yè';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} jou pase`;
    } else {
      return date.toLocaleDateString('fr-HT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="historik-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Kap chèche done ou yo...</p>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="historik-container">
        <div className="auth-required">
          <div className="auth-icon">🔐</div>
          <h2>Koneksyon Obligatwa</h2>
          <p>Ou dwe konekte pou w ka wè istorik kiz ou yo.</p>
          <a href="/login" className="auth-btn">Konekte</a>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // Empty history
  if (!history.length) {
    return (
      <div className="historik-container">
        <header className="historik-header">
          <h1 className="historik-title">
            <span className="title-icon">📈</span>
            Istorik Kiz Ou
          </h1>
        </header>
        
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2 className="empty-title">Pa gen istorik ankò</h2>
          <p className="empty-desc">
            Ou poko fè okenn kiz. Kòmanse pratike ak vre kesyon egzamen yo!
          </p>
          <a href="/universites" className="empty-cta">
            <span className="cta-icon">🚀</span>
            Kòmanse Premye Kiz Ou
          </a>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // Detail view
  if (selected !== null) {
    const entry = history[selected];
    const percentage = calculatePercentage(entry.score, entry.total);
    
    return (
      <div className="historik-container">
        <header className="detail-header">
          <button 
            onClick={() => setSelected(null)} 
            className="back-btn"
            aria-label="Tounen nan lis la"
          >
            <span className="back-icon">←</span>
            Tounen
          </button>
          <h1 className="detail-title">Detay Rezilta</h1>
        </header>

        <div className="detail-content">
          <div className="quiz-summary">
            <h2 className="quiz-name">{entry.quizName}</h2>
            <div className="quiz-stats">
              <div className="stat-item">
                <span className="stat-label">Rezilta</span>
                <span className="stat-value">{entry.score} / {entry.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pousan</span>
                <span className={`stat-value ${percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : 'poor'}`}>
                  {percentage}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Dat</span>
                <span className="stat-value">{formatDate(entry.date)}</span>
              </div>
            </div>
          </div>

          <div className="questions-review">
            <h3 className="review-title">
              <span className="review-icon">📝</span>
              Revizyon Kesyon yo
            </h3>
            
            {entry.questions.map((q, idx) => (
              <div key={idx} className="question-card">
                <div className="question-header">
                  <span className="question-number">Kesyon {idx + 1}</span>
                  <span className={`question-status ${
                    entry.answers[idx] && 
                    (q.type === "qcm" ? 
                      (() => {
                        let reponsKorekArr = [];
                        if (q.reponsKorek.length === 1 && !q.reponsKorek.includes(',')) {
                          if (isNaN(q.reponsKorek)) {
                            const letterIndex = q.reponsKorek.charCodeAt(0) - 97;
                            reponsKorekArr = [String(letterIndex)];
                          } else {
                            reponsKorekArr = [q.reponsKorek];
                          }
                        } else {
                          reponsKorekArr = String(q.reponsKorek)
                            .split(',')
                            .map(i => i.trim())
                            .filter(i => i !== '')
                            .map(i => String(Number(i)));
                        }
                        const userChwaArr = Array.isArray(entry.answers[idx]) ? entry.answers[idx] : [entry.answers[idx]];
                        return reponsKorekArr.some(correct => userChwaArr.includes(correct));
                      })() :
                      entry.answers[idx].toLowerCase().trim() === (q.reponsKorek || '').toLowerCase().trim()
                    ) ? 'correct' : 'incorrect'
                  }`}>
                    {entry.answers[idx] && 
                    (q.type === "qcm" ? 
                      (() => {
                        let reponsKorekArr = [];
                        if (q.reponsKorek.length === 1 && !q.reponsKorek.includes(',')) {
                          if (isNaN(q.reponsKorek)) {
                            const letterIndex = q.reponsKorek.charCodeAt(0) - 97;
                            reponsKorekArr = [String(letterIndex)];
                          } else {
                            reponsKorekArr = [q.reponsKorek];
                          }
                        } else {
                          reponsKorekArr = String(q.reponsKorek)
                            .split(',')
                            .map(i => i.trim())
                            .filter(i => i !== '')
                            .map(i => String(Number(i)));
                        }
                        const userChwaArr = Array.isArray(entry.answers[idx]) ? entry.answers[idx] : [entry.answers[idx]];
                        return reponsKorekArr.some(correct => userChwaArr.includes(correct));
                      })() :
                      entry.answers[idx].toLowerCase().trim() === (q.reponsKorek || '').toLowerCase().trim()
                    ) ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="question-text">{q.texte}</div>
                
                {q.type === "qcm" && q.choix ? (
                  <div className="choices-review">
                    {q.choix.map((ch, cidx) => {
                      let chText = ch.trim();
                      if (/^[a-z]\)/i.test(chText)) {
                        chText = chText.replace(/^[a-z]\)\s*/, '');
                      }
                      chText = chText.replace(/[✓✔️❌]\s*$/, '').trim();
                      
                      let reponsKorekArr = [];
                      if (q.reponsKorek.length === 1 && !q.reponsKorek.includes(',')) {
                        if (isNaN(q.reponsKorek)) {
                          const letterIndex = q.reponsKorek.charCodeAt(0) - 97;
                          reponsKorekArr = [String(letterIndex)];
                        } else {
                          reponsKorekArr = [q.reponsKorek];
                        }
                      } else {
                        reponsKorekArr = String(q.reponsKorek)
                          .split(',')
                          .map(i => i.trim())
                          .filter(i => i !== '')
                          .map(i => String(Number(i)));
                      }
                      
                      const userChwaArr = Array.isArray(entry.answers[idx]) ? entry.answers[idx] : [entry.answers[idx]];
                      const isCorrect = reponsKorekArr.includes(String(cidx));
                      const isChosen = userChwaArr.includes(String(cidx));
                      const label = String.fromCharCode(97 + cidx) + ")";
                      
                      return (
                        <div key={cidx} className={`choice-item ${
                          isCorrect ? 'correct-choice' : ''
                        } ${isChosen ? 'chosen-choice' : ''}`}>
                          <span className="choice-label">{label}</span>
                          <span className="choice-text">{chText}</span>
                          <span className="choice-status">
                            {isChosen && (isCorrect ? '✅' : '❌')}
                            {!isChosen && isCorrect && '✅'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-answer-review">
                    <div className="user-answer">
                      <span className="answer-label">Repons ou:</span>
                      <span className={`answer-value ${
                        entry.answers[idx] && entry.answers[idx].toLowerCase().trim() === (q.reponsKorek || '').toLowerCase().trim() 
                          ? 'correct-answer' : 'incorrect-answer'
                      }`}>
                        {entry.answers[idx] || 'Pa gen repons'}
                      </span>
                    </div>
                    {q.reponsKorek && (
                      <div className="correct-answer">
                        <span className="answer-label">Repons kòrèk:</span>
                        <span className="answer-value correct-answer">{q.reponsKorek}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // Main history view
  const filteredHistory = getFilteredAndSortedHistory();

  return (
    <div className="historik-container">
      <header className="historik-header">
        <h1 className="historik-title">
          <span className="title-icon">📈</span>
          Istorik Kiz Ou
        </h1>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="badge-number">{history.length}</span>
            <span className="badge-label">Total Kiz</span>
          </div>
          <div className="stat-badge">
            <span className="badge-number">
              {Math.round(history.reduce((acc, h) => acc + calculatePercentage(h.score, h.total), 0) / history.length) || 0}%
            </span>
            <span className="badge-label">Mwayèn</span>
          </div>
        </div>
      </header>

      <div className="controls-section">
        <div className="filter-controls">
          <div className="control-group">
            <label className="control-label">Òganize pa:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="date">Dat</option>
              <option value="score">Nòt</option>
              <option value="name">Non</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="control-label">Filtre:</label>
            <select 
              value={filterBy} 
              onChange={(e) => setFilterBy(e.target.value)}
              className="control-select"
            >
              <option value="all">Tout</option>
              <option value="passed">Pase (≥60%)</option>
              <option value="failed">Echwe (&lt;60%)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="history-content">
        {filteredHistory.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Pa gen rezilta</h3>
            <p>Pa gen kiz ki matche ak filtre ou chwazi a.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="desktop-table">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Dat</th>
                    <th>Non Kiz</th>
                    <th>Rezilta</th>
                    <th>Pousan</th>
                    <th>Aksyon</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h, idx) => {
                    const originalIdx = history.indexOf(h);
                    const percentage = calculatePercentage(h.score, h.total);
                    
                    return (
                      <tr key={originalIdx} className="history-row">
                        <td className="date-cell">
                          <span className="date-text">{formatDate(h.date)}</span>
                          <span className="time-text">
                            {new Date(h.date).toLocaleTimeString('fr-HT', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="quiz-cell">
                          <span className="quiz-name">{h.quizName}</span>
                        </td>
                        <td className="score-cell">
                          <span className="score-fraction">{h.score} / {h.total}</span>
                        </td>
                        <td className="percentage-cell">
                          <span className={`percentage-badge ${
                            percentage >= 80 ? 'excellent' : 
                            percentage >= 60 ? 'good' : 'poor'
                          }`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="action-cell">
                          <button 
                            onClick={() => setSelected(originalIdx)}
                            className="view-btn"
                            aria-label={`Wè detay ${h.quizName}`}
                          >
                            <span className="btn-icon">👁️</span>
                            Wè Detay
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards">
              {filteredHistory.map((h, idx) => {
                const originalIdx = history.indexOf(h);
                const percentage = calculatePercentage(h.score, h.total);
                
                return (
                  <div key={originalIdx} className="history-card">
                    <div className="card-header">
                      <div className="card-date">
                        <span className="date-main">{formatDate(h.date)}</span>
                        <span className="date-time">
                          {new Date(h.date).toLocaleTimeString('fr-HT', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span className={`card-percentage ${
                        percentage >= 80 ? 'excellent' : 
                        percentage >= 60 ? 'good' : 'poor'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    
                    <div className="card-content">
                      <h3 className="card-quiz-name">{h.quizName}</h3>
                      <div className="card-score">
                        <span className="score-label">Rezilta:</span>
                        <span className="score-value">{h.score} / {h.total}</span>
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <button 
                        onClick={() => setSelected(originalIdx)}
                        className="card-btn"
                        aria-label={`Wè detay ${h.quizName}`}
                      >
                        <span className="btn-icon">👁️</span>
                        Wè Detay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      <BottomNavbar />
    </div>
  );
}

export default HistorikQuiz;