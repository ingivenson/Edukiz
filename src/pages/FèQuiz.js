import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { UserContext } from "../UserContext";
import BottomNavbar from "../components/BottomNavbar";

function FeQuiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [multipleAnswers, setMultipleAnswers] = useState({});
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const ref = doc(db, "examens", quizId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const quizData = snap.data();
          console.log("Quiz data:", quizData); // Debug
          setQuiz(quizData);
          setAnswers(Array(quizData.questions.length).fill(""));
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [quizId]);

  const handleChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[current] = value;
    setAnswers(newAnswers);
  };

  const handleMultipleChoice = (value) => {
    const currentAnswers = multipleAnswers[current] || [];
    const newMultipleAnswers = { ...multipleAnswers };
    if (currentAnswers.includes(value)) {
      newMultipleAnswers[current] = currentAnswers.filter(val => val !== value);
    } else {
      newMultipleAnswers[current] = [...currentAnswers, value];
    }
    const newAnswers = [...answers];
    newAnswers[current] = newMultipleAnswers[current].sort().join(',');
    setMultipleAnswers(newMultipleAnswers);
    setAnswers(newAnswers);
  };

  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      const currentQuestion = quiz.questions[current];
      if (currentQuestion && currentQuestion.type === "qcm" && !multipleAnswers[current]) {
        setMultipleAnswers(prev => ({
          ...prev,
          [current]: []
        }));
      }
    }
    // eslint-disable-next-line
  }, [current, quiz]);

  const handleNext = (e) => {
    e.preventDefault();
    if (!answers[current] || answers[current] === "") {
      alert("Tanpri chwazi repons ou avan ou kontinye.");
      return;
    }
    if (current < quiz.questions.length - 1) {
      setCurrent(prevCurrent => prevCurrent + 1);
    } else {
      let sc = 0;
      quiz.questions.forEach((q, idx) => {
        if (!q.reponsKorek) {
          console.warn(`Question ${idx + 1} n'a pas de réponse correcte définie.`);
          return;
        }

        if (q.type === "vrai_faux" || q.type === "konplete") {
          if (
            answers[idx] && answers[idx].toLowerCase().trim() === (q.reponsKorek || "").toLowerCase().trim()
          ) {
            sc++;
          }
        } else if (q.type === "qcm") {
          if (answers[idx] !== "") {
            if (q.reponsKorek.length === 1 && !q.reponsKorek.includes(',')) {
              if (isNaN(q.reponsKorek)) {
                const letterIndex = q.reponsKorek.charCodeAt(0) - 97;
                if (answers[idx] === String(letterIndex)) {
                  sc++;
                }
              } else {
                // Convert 1-based index to 0-based index
                const zeroBasedIndex = parseInt(q.reponsKorek, 10) - 1;
                if (answers[idx] === String(zeroBasedIndex)) {
                  sc++;
                }
              }
            } else if (String(q.reponsKorek) === String(answers[idx])) {
              sc++;
            }
          }
        }
      });
      setScore(sc);
      setShowResult(true);
      if (user) {
        const userKey = `quiz_history_${user.uid}`;
        const existingHistory = JSON.parse(localStorage.getItem(userKey) || "[]");
        const historyEntry = {
          date: new Date().toISOString(),
          quizId,
          quizName: quiz.nom || quiz.annee || "Kiz san non",
          score: sc,
          total: quiz.questions.length,
          answers,
          questions: quiz.questions
        };
        existingHistory.unshift(historyEntry);
        localStorage.setItem(userKey, JSON.stringify(existingHistory));
      }
    }
  };

  if (loading) return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign:"center", padding:20}}>Chajman...</div>
      <BottomNavbar />
    </div>
  );
  
  if (!quiz) return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign:"center", padding:20}}>Quiz pa jwenn.</div>
      <BottomNavbar />
    </div>
  );

  // Afichaj rezilta yo
  if (showResult) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        padding: '20px',
        paddingBottom: '100px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{
              color: '#1e5bbf',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 10px 0'
            }}>
              🎉 Rezilta Kiz la
            </h2>
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              color: score >= quiz.questions.length * 0.7 ? '#22c55e' : score >= quiz.questions.length * 0.5 ? '#f59e0b' : '#ef4444'
            }}>
              {score} / {quiz.questions.length}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#6b7280',
              marginTop: '5px'
            }}>
              {Math.round((score / quiz.questions.length) * 100)}% kòrèk
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => navigate('/historik')}
              style={{
                background: '#1e5bbf',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              📊 Wè Istorik
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🏠 Akèy
            </button>
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  const q = quiz.questions[current];
  
  // Get real data from quiz object
  const getQuizInfo = () => {
    const quizName = quiz.nom || quiz.title || quiz.annee || "Quiz";
    const matiere = quiz.matiere || quiz.subject || "Matye";
    const universite = quiz.universite || quiz.university || "Inivèsite";
    
    return { quizName, matiere, universite };
  };
  
  const { quizName, matiere, universite } = getQuizInfo();
  
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f1f5f9',
      padding: '10px',
      paddingBottom: '100px', // Space for navbar
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 4px 28px rgba(0,0,0,0.1)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: 'auto'
      }}>
        {/* Header ak logo ak bouton tounen */}
        <div style={{
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          background: 'linear-gradient(135deg, #1e5bbf 0%, #4095ff 100%)',
          padding: '15px 20px',
          color: '#fff',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Bouton tounen nan kwen gòch */}
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: '600'
            }}
          >
            ← Tounen
          </button>
          
          {/* Logo nan kwen dwat */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/IMAGE/jwe%20yon.PNG" 
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{
              display: 'none',
              fontSize: '20px'
            }}>
              🎓
            </div>
          </div>
        </div>
        
        {/* Enfo Quiz ak Progress */}
        <div style={{ 
          padding: '20px 20px 15px', 
          background: '#fff',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {/* Tit Quiz */}
          <div style={{
            fontSize: 'clamp(18px, 4vw, 22px)',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            📝 {quizName}
          </div>
          
          {/* Enfo Matye ak Inivèsite */}
          <div style={{
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '15px',
            fontWeight: '500'
          }}>
            {matiere} • {universite}
          </div>
          
          {/* Konte ak Progress */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '600'
            }}>
              Kesyon {current + 1} nan {quiz.questions?.length || 0}
            </span>
            <span style={{
              fontSize: '14px',
              color: '#1e5bbf',
              fontWeight: '600',
              background: 'rgba(30, 91, 191, 0.1)',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {Math.round(((current + 1) / (quiz.questions?.length || 1)) * 100)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            height: 8, 
            background: '#e5e7eb',
            borderRadius: 8, 
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4095ff, #1e5bbf)',
              borderRadius: 8,
              width: `${((current + 1) / (quiz.questions?.length || 1)) * 100}%`,
              transition: 'width 0.5s ease',
              boxShadow: '0 1px 3px rgba(64, 149, 255, 0.4)'
            }}/>
          </div>
        </div>

        {/* QUESTION Box */}
        <div style={{
          margin: '14px 16px 0',
          background: '#fff',
          borderRadius: 13,
          boxShadow: '0 2px 10px #0001',
          border: '1.5px solid #ececec',
          padding: '20px 18px 14px 18px',
        }}>
          <div style={{
            fontWeight: 600,
            marginBottom: 12,
            fontSize: 17,
            color: '#1e293b'
          }}>
            {q.texte}
          </div>
          {/* QCM */}
          {q.type === "qcm" && q.choix && (
            <div>
              {q.choix.map((ch, cidx) => {
                const checked = (multipleAnswers[current] || []).includes(String(cidx));
                return (
                  <label
                    key={cidx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: checked ? '#e0f0ff' : '#f7faff',
                      border: checked ? '2px solid #1e5bbf' : '2px solid #e0e7ef',
                      borderRadius: 12,
                      fontWeight: checked ? 600 : 500,
                      fontSize: 15,
                      marginBottom: 12,
                      padding: '12px 16px',
                      transition: 'all 0.18s',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      style={{marginRight: 12, accentColor: "#4095ff"}}
                      type="checkbox"
                      value={cidx}
                      checked={checked}
                      onChange={e => handleMultipleChoice(e.target.value)}
                    />
                    <span style={{marginRight: 12, fontWeight: 'bolder'}}>{String.fromCharCode(65+cidx)}.</span>
                    <span>{ch}</span>
                  </label>
                );
              })}
            </div>
          )}
          {/* Vrai / Faux */}
          {q.type === "vrai_faux" && (
            <div style={{ display: "flex", gap: 20 }}>
              <label style={{
                flex: 1,
                background: answers[current] === "vrai" ? "#e0f0ff" : "#f7faff",
                border: answers[current] === "vrai" ? "2px solid #1e5bbf" : "2px solid #e0e7ef",
                borderRadius: 10,
                fontWeight: 600,
                textAlign: "center",
                padding: 14
              }}>
            <input type="radio" name="vrai_faux" value="vrai" style={{marginRight:5}}
              checked={answers[current]==="vrai"} onChange={e=>handleChange(e.target.value)}/>
                Vrai
              </label>
              <label style={{
                flex: 1,
                background: answers[current] === "faux" ? "#e0f0ff" : "#f7faff",
                border: answers[current] === "faux" ? "2px solid #1e5bbf" : "2px solid #e0e7ef",
                borderRadius: 10,
                fontWeight: 600,
                textAlign: "center",
                padding: 14
              }}>
            <input type="radio" name="vrai_faux" value="faux" style={{marginRight:5}}
              checked={answers[current]==="faux"} onChange={e=>handleChange(e.target.value)}/>
                Faux
              </label>
            </div>
          )}
          {/* Complete & Open questions */}
          {q.type === "konplete" && (
            <input
              type="text"
              value={answers[current]}
              onChange={e => handleChange(e.target.value)}
              placeholder="Repons ou"
              style={{
                width: '100%',
                padding: 10,
                fontSize: 15,
                borderRadius: 9,
                border: '1.5px solid #dfdfdf',
                marginTop: 8,
                outline: 'none'
              }}
            />
          )}
          {q.type === "ouve" && (
            <textarea
              value={answers[current]}
              onChange={e => handleChange(e.target.value)}
              placeholder="Repons ou (koreksyon manyèl)"
              rows={4}
              style={{
                width: '100%',
                fontSize: 15,
                minHeight: 45,
                borderRadius: 9,
                border: '1.5px solid #dfdfdf',
                marginTop: 8,
                padding: 8,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          )}
        </div>

        {/* Bouton navigasyon */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          margin: '30px 24px 0 24px'
        }}>
          {/* Bouton Dèyè nan pwent gòch */}
          <button
            type="button"
            disabled={current === 0}
            onClick={()=> setCurrent(current-1)}
            style={{
              background: current === 0 ? '#f1f5f9' : '#e5e7eb',
              color: current === 0 ? '#b0b3bc' : '#374151',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              padding: '12px 20px',
              minWidth: 80,
              opacity: current === 0 ? 0.5 : 1,
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              outline: "none",
              transition: 'all 0.3s ease'
            }}
          >
            ← Dèyè
          </button>
          
          {/* Bouton Kontinye/Voye nan pwent dwat */}
          <button
            type="button"
            onClick={handleNext}
            style={{
              background: 'linear-gradient(45deg, #4095ff, #1e5bbf)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              padding: '14px 28px',
              minWidth: 140,
              boxShadow: '0 4px 15px rgba(64, 149, 255, 0.3)',
              cursor: 'pointer',
              outline: "none",
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(64, 149, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(64, 149, 255, 0.3)';
            }}
          >
            {current < quiz.questions.length-1 ? "Kontinye →" : "🚀 Voye"}
          </button>
        </div>
      </div>
      
      {/* Bottom Navbar */}
      <BottomNavbar />
      
      {/* Responsive CSS */}
      <style jsx>{`
        /* Mobile First - Base styles for mobile */
        @media (max-width: 480px) {
          .quiz-container {
            padding: 5px !important;
            margin: 5px !important;
          }
          
          .question-box {
            padding: 15px 12px !important;
            margin: 10px 8px 0 !important;
          }
          
          .nav-buttons {
            margin: 20px 15px 0 15px !important;
            gap: 10px !important;
          }
          
          .nav-button {
            padding: 10px 15px !important;
            font-size: 14px !important;
            min-width: 50px !important;
          }
          
          .header-padding {
            padding: 12px 15px 8px !important;
          }
          
          .sub-header-padding {
            padding: 0 15px !important;
          }
        }
        
        /* Tablet styles */
        @media (min-width: 481px) and (max-width: 768px) {
          .quiz-container {
            max-width: 600px !important;
            padding: 15px !important;
          }
          
          .question-box {
            padding: 25px 20px !important;
            margin: 15px 20px 0 !important;
          }
        }
        
        /* Desktop styles */
        @media (min-width: 769px) {
          .quiz-container {
            max-width: 700px !important;
          }
        }
        
        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .quiz-main-container {
            padding-top: 5px !important;
            padding-bottom: 90px !important;
          }
          
          .quiz-container {
            margin-top: 5px !important;
          }
        }
        
        /* Very small screens */
        @media (max-width: 320px) {
          .header-title {
            font-size: 14px !important;
          }
          
          .sub-header-title {
            font-size: 12px !important;
          }
          
          .question-text {
            font-size: 15px !important;
          }
          
          .choice-text {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default FeQuiz;
