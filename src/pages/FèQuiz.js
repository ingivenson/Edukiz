import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { UserContext } from "../UserContext";
import BottomNavbar from "../components/BottomNavbar";
import LoadingSpinner from "../components/LoadingSpinner";

// Fonksyon pou melanje kesyon yo
const shuffleQuestions = (questions) => {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function FeQuiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [multipleAnswers, setMultipleAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "examens", quizId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const quizData = snap.data();
          
          // Asire ke questions yo egziste epi yo pa vid
          if (quizData.questions && quizData.questions.length > 0) {
            // Melanje kesyon yo
            const shuffledQuestions = shuffleQuestions(quizData.questions);
            setQuestions(shuffledQuestions);
            
            // Mete done quiz la ak nouvo kesyon melanje yo
            const { questions, ...quizWithoutQuestions } = quizData;
            setQuiz({ ...quizWithoutQuestions, questions: shuffledQuestions });
            
            // Inisyalize repons yo
            setAnswers(Array(shuffledQuestions.length).fill(""));
            setMultipleAnswers({}); // Reset multiple answers
          } else {
            console.error("No questions found in quiz data");
          }
        } else {
          console.error("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
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

  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const playSound = (isCorrect) => {
    const audio = new Audio(isCorrect ? '/sounds/correct.mp3' : '/sounds/incorrect.mp3');
    audio.play();
  };

  const calculateScore = () => {
    let sc = 0;
    questions.forEach((q, idx) => {
      if (!q.reponsKorek) {
        console.warn(`Question ${idx + 1} n'a pas de réponse correcte définie.`);
        return;
      }

      if (q.type === "vrai_faux" || q.type === "konplete") {
        if (answers[idx] && String(answers[idx]).toLowerCase().trim() === String(q.reponsKorek || "").toLowerCase().trim()) {
          sc++;
        }
      } else if (q.type === "qcm") {
        const userAnswer = String(answers[idx] || "").trim();
        const correctAnswer = String(q.reponsKorek || "").trim();
        if (userAnswer && userAnswer === correctAnswer) {
          sc++;
        }
      }
    });
    return sc;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!answers[current] || answers[current] === "") {
      alert("Tanpri, chwazi yon repons!");
      return;
    }

    // Verifye si repons lan bon
    const currentQuestion = questions[current];
    let isCorrect = false;

    if (currentQuestion.type === "vrai_faux" || currentQuestion.type === "konplete") {
      isCorrect = String(answers[current]).toLowerCase().trim() === String(currentQuestion.reponsKorek || "").toLowerCase().trim();
    } else if (currentQuestion.type === "qcm") {
      const userAnswer = String(answers[current] || "").trim();
      const correctAnswer = String(currentQuestion.reponsKorek || "").trim();
      isCorrect = userAnswer === correctAnswer;
    }

    // Jwe son epi montre tèks
    playSound(isCorrect);
    setFeedback(isCorrect ? "Bravo! Ou jwenn bon repons lan! 🎉" : "Ou pa jwenn bon repons lan. Pa dekouraje! 😕");
    setFeedbackType(isCorrect ? "correct" : "incorrect");

    // Tann 1.5 segonn anvan pwochen kesyon an
    setTimeout(() => {
      setFeedback("");
      setFeedbackType("");
      if (current < questions.length - 1) {
        setCurrent(prevCurrent => prevCurrent + 1);
      } else {
        const sc = calculateScore();
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
            questions: questions
          };
          existingHistory.unshift(historyEntry);
          localStorage.setItem(userKey, JSON.stringify(existingHistory));
        }
      }
    }, 1500);
  };

  if (loading) return <LoadingSpinner />;
  
  if (!quiz) return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      background: '#f1f5f9'
    }}>
      <div style={{
        background: '#fff',
        padding: '20px 30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        color: '#1e293b',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        Quiz pa jwenn 😕
      </div>
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

  const q = questions[current];
  
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
          backgroundImage: 'url(https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=2)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '15px 20px',
          color: '#fff',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className="header-overlay" aria-hidden="true" style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            borderRadius: '20px 20px 0 0' 
          }} />
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
              Kesyon {current + 1} nan {questions.length || 0}
            </span>
            <span style={{
              fontSize: '14px',
              color: '#1e5bbf',
              fontWeight: '600',
              background: 'rgba(30, 91, 191, 0.1)',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {Math.round(((current + 1) / (questions.length || 1)) * 100)}%
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
              width: `${((current + 1) / (questions.length || 1)) * 100}%`,
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

        {/* Feedback mesaj */}
        {feedback && (
          <div style={{
            textAlign: 'center',
            margin: '20px 16px 0',
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: feedbackType === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedbackType === 'correct' ? '#166534' : '#991b1b',
            fontWeight: '600',
            fontSize: '16px',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            {feedback}
          </div>
        )}

        {/* Bouton navigasyon */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          margin: '30px 24px 30px 24px'
        }}>
          {/* Bouton Kontinye/Voye */}
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
        
        /* Animasyon pou feedback */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
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
