import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import "../css/EtidyeEgzamen.css";

function EtidyeEgzamen() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log("🔍 Kap chèche egzamen ak ID:", quizId);
        
        // Eseye jwenn nan koleksyon "examens" anvan
        let docRef = doc(db, "examens", quizId);
        let docSnap = await getDoc(docRef);
        
        // Si pa jwenn nan "examens", eseye nan "quiz"
        if (!docSnap.exists()) {
          console.log("📝 Pa jwenn nan 'examens', eseye nan 'quiz'...");
          docRef = doc(db, "quiz", quizId);
          docSnap = await getDoc(docRef);
        }
        
        if (docSnap.exists()) {
          const quizData = { id: docSnap.id, ...docSnap.data() };
          console.log("✅ Egzamen jwenn:", quizData);
          console.log("📋 Kesyon yo:", quizData.questions?.length || 0);
          setQuiz(quizData);
        } else {
          console.log("❌ Pa jwenn egzamen nan okenn koleksyon");
        }
        setLoading(false);
      } catch (error) {
        console.error("❌ Erè lè chèche egzamen:", error);
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Ap chaje...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="error-container">
        <h2>Egzamen sa a pa egziste</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          Retounen
        </button>
      </div>
    );
  }

  return (
    <div className="etidye-container">
      <div className="header-section" style={{
        backgroundImage:
          'url(https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=2)'
      }}>
        <div className="header-overlay" aria-hidden="true" />
        <button onClick={() => navigate(-1)} className="back-button">
          ← Retounen
        </button>
        <h1>{quiz.nom || "Egzamen"}</h1>
        <p className="quiz-info">
          {quiz.matiere} | Ane {quiz.annee}
          {quiz.duree && ` | ${quiz.duree} minit`}
        </p>
      </div>

      <div className="questions-container">
        {quiz.questions && quiz.questions.length > 0 ? (
          quiz.questions.map((question, idx) => (
            <div key={idx} className="question-card">
                          <div className="question-header">
              <span className="question-number">Kesyon {idx + 1}</span>
            </div>
              
              <p className="question-text">{question.texte || question.question || "Pa gen tèks kesyon"}</p>

              {/* Repons la dirèkteman anba kesyon an */}
              <div className="answer-section">
                {question.reponsKorek && (
                  <div className="answer-display">
                    <div className="correct-answer">
                      {question.type === "qcm" && question.choix ? (
                        // Pou QCM, montre repons la ekri nan choix yo
                        Array.isArray(question.reponsKorek) ? 
                          question.reponsKorek.map((correctIdx, cIdx) => {
                            const choiceIndex = parseInt(correctIdx);
                            const choiceText = question.choix[choiceIndex];
                            return (
                              <span key={cIdx} className="correct-choice">
                                {choiceText}
                              </span>
                            );
                          }) : 
                          // Si reponsKorek se yon chif, chèche li nan choix yo
                          (() => {
                            const correctIndex = parseInt(question.reponsKorek);
                            if (!isNaN(correctIndex) && question.choix[correctIndex]) {
                              return <span className="correct-choice">{question.choix[correctIndex]}</span>;
                            } else {
                              return <span className="correct-choice">{question.reponsKorek}</span>;
                            }
                          })()
                      ) : (
                        // Pou tout lòt tip, montre repons la dirèkteman
                        <span className="correct-answer-text">
                          {question.reponsKorek}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-questions">
            <h3>Pa gen kesyon disponib</h3>
            <p>Egzamen sa a pa gen kesyon oswa kesyon yo pa kòrèkteman fòmate.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EtidyeEgzamen;