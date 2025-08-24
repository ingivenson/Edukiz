 import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import BottomNavbar from "../components/BottomNavbar";
import LoadingSpinner from "../components/LoadingSpinner";
import '../css/QuizListMatiere.css';

function QuizListMatiere() {
  const { universiteId, matiereId } = useParams();
  const [quizList, setQuizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matiereNom, setMatiereNom] = useState("");
  const [universiteNom, setUniversiteNom] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setQuizList([]); // Reset quiz list before fetching
      
      try {
        // Fetch matiere info first
        const matiereRef = doc(db, "matieres", matiereId);
        const matiereSnap = await getDoc(matiereRef);
        if (matiereSnap.exists()) {
          const matiereData = matiereSnap.data();
          setMatiereNom(matiereData.nom || "Matye");
        } else {
          console.error("Matye pa jwenn");
          setMatiereNom("Matye");
        }
        
        // Fetch universite info
        const univRef = doc(db, "universites", universiteId);
        const univSnap = await getDoc(univRef);
        if (univSnap.exists()) {
          const univData = univSnap.data();
          setUniversiteNom(univData.nom || "Inivèsite");
        } else {
          console.error("Inivèsite pa jwenn");
          setUniversiteNom("Inivèsite");
        }
        
        // Fetch quizzes and exams
        const q = query(
          collection(db, "examens"),
          where("universiteId", "==", universiteId),
          where("matiereId", "==", matiereId)
        );
        
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort by year in descending order and update state
        const sortedList = list.sort((a, b) => {
          const yearA = a.annee || 0;
          const yearB = b.annee || 0;
          return yearB - yearA;
        });
        
        setQuizList(sortedList);
        
      } catch (error) {
        console.error("❌ Erè nan chèche done yo:", error);
        setQuizList([]); // Reset on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [universiteId, matiereId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="quiz-list-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-top">
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <span className="back-icon">←</span>
            <span className="back-text">Tounen</span>
          </button>
          
          <div className="header-logo">
            <div className="logo-circle">
              📚
            </div>
          </div>
        </div>
        
        <div className="header-content">
          <h1 className="main-title">Kiz ak Egzamen Pase yo</h1>
          <p className="subject-name">{matiereNom}</p>
          <p className="university-name">{universiteNom}</p>
          <div className="quiz-count">
            {quizList.length} egzamen ak kiz disponib
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {quizList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-circle">
                <span className="empty-icon">📝</span>
              </div>
            </div>
            <h3 className="empty-title">Pa gen egzamen pase yo ankò</h3>
            <p className="empty-description">
              Pa gen kiz oswa egzamen pase ki disponib pou matye sa a kounye a.
              <br />
              Kontakte administratè a pou ajoute egzamen pase yo.
            </p>
          </div>
        ) : (
          <div className="quiz-container">
            <div className="quiz-grid">
              {quizList.map((quiz, index) => (
                <div 
                  key={quiz.id} 
                  className="quiz-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-header">
                    <div className="quiz-year-badge">
                      <span className="year-label">Ane</span>
                      <span className="year-number">{quiz.annee || "N/A"}</span>
                    </div>
                    <div className="quiz-type-icon">
                      {quiz.nom ? "📝" : "📋"}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h3 className="quiz-title">
                      {quiz.nom || `Egzamen ${quiz.annee || ""}`}
                    </h3>
                    <p className="quiz-description">
                      {quiz.nom 
                        ? `Kiz pase: ${quiz.nom} (${quiz.annee})` 
                        : `Egzamen pase nan ane ${quiz.annee || "N/A"}`
                      }
                    </p>
                    <div className="quiz-meta">
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-text">Ane {quiz.annee}</span>
                      </span>
                      {quiz.duree && (
                        <span className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          <span className="meta-text">{quiz.duree} min</span>
                        </span>
                      )}
                      <span className="meta-item">
                        <span className="meta-icon">📋</span>
                        <span className="meta-text">Egzamen Pase</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="button-group">
                      <button
                        className="practice-button"
                        onClick={() => navigate(`/universites/${universiteId}/matieres/${matiereId}/egzamen/${quiz.id}/etidye`)}
                      >
                        <span className="button-icon">📚</span>
                        <span className="button-text">Etidye</span>
                        <span className="button-arrow">→</span>
                      </button>
                      <button
                        className="quiz-button"
                        onClick={() => navigate(`/universites/${universiteId}/matieres/${matiereId}/quiz/${quiz.id}`)}
                      >
                        <span className="button-icon">🎯</span>
                        <span className="button-text">Fè Tès</span>
                        <span className="button-arrow">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
}

export default QuizListMatiere;