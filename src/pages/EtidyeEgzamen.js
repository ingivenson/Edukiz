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
        const docRef = doc(db, "examens", quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuiz({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error("Erè:", error);
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
      <div className="header-section">
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
        {quiz.questions.map((question, idx) => (
          <div key={idx} className="question-card">
            <div className="question-header">
              <span className="question-number">Kesyon {idx + 1}</span>
              <span className="question-type">{question.type.toUpperCase()}</span>
            </div>
            
            <p className="question-text">{question.texte}</p>

            {question.type === "qcm" && (
              <div className="choices-container">
                {question.choix.map((choice, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`choice-item ${
                      question.reponsKorek.includes(String(cIdx)) ? "correct" : ""
                    }`}
                  >
                    <span className="choice-letter">
                      {String.fromCharCode(65 + cIdx)}
                    </span>
                    <span className="choice-text">{choice}</span>
                  </div>
                ))}
              </div>
            )}

            {question.type === "vrai_faux" && (
              <div className="true-false-container">
                <div className={`tf-option ${question.reponsKorek === "vrai" ? "correct" : ""}`}>
                  Vrai
                </div>
                <div className={`tf-option ${question.reponsKorek === "faux" ? "correct" : ""}`}>
                  Faux
                </div>
              </div>
            )}

            {question.type === "konplete" && (
              <div className="blank-answer">
                <strong>Repons: </strong>
                <span className="correct-answer">{question.reponsKorek}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EtidyeEgzamen;