import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import BottomNavbar from '../components/BottomNavbar';
import LoadingSpinner from '../components/LoadingSpinner';
import '../css/MatieresUniversite.css';
import '../css/buttons.css';

function Antrenman() {
  const { universiteId, matiereId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [matiere, setMatiere] = useState(null);
  const [examens, setExamens] = useState([]);
  const [universite, setUniversite] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Chache enfòmasyon matye a
        const matiereRef = doc(db, "matieres", matiereId);
        const matiereSnap = await getDoc(matiereRef);
        if (matiereSnap.exists()) {
          setMatiere(matiereSnap.data());
        }

        // Chache enfòmasyon inivèsite a
        const universiteRef = doc(db, "universites", universiteId);
        const universiteSnap = await getDoc(universiteRef);
        if (universiteSnap.exists()) {
          setUniversite(universiteSnap.data());
        }

        // Chache tout egzamen yo pou matye sa a
        const q = query(
          collection(db, "examens"),
          where("matiereId", "==", matiereId)
        );
        const querySnapshot = await getDocs(q);
        const examensData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setExamens(examensData);
        setLoading(false);
      } catch (error) {
        console.error("Erè pandan chajman done yo:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [matiereId, universiteId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="matieres-container">
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
          <h1 className="main-title">Antrènman</h1>
          <p className="university-subtitle">{matiere?.nom} - {universite?.nom}</p>
          <div className="subjects-count">
            {examens.length} egzamen disponib pou pratike
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {examens.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-circle">
                <span className="empty-icon">📝</span>
              </div>
            </div>
            <h3 className="empty-title">Pa gen egzamen pou pratike</h3>
            <p className="empty-description">
              Poko gen egzamen ki disponib pou matye sa a.
              <br />
              Tanpri chwazi yon lòt matye oswa retounen pita.
            </p>
          </div>
        ) : (
          <div className="subjects-container">
            <div className="subjects-grid">
              {examens.map((examen, index) => (
                <div
                  key={examen.id}
                  className="subject-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-header">
                    <div className="subject-icon-container">
                      <span className="subject-icon">📝</span>
                    </div>
                    <div className="card-menu">
                      <span className="menu-dots">⋯</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h3 className="subject-title">
                      {examen.nom || `Egzamen ${examen.annee || "San Dat"}`}
                    </h3>
                    <p className="subject-description">
                      {examen.questions?.length || 0} kesyon
                      {examen.duree ? ` • ${examen.duree} minit` : ""}
                    </p>
                  </div>
                  
                  <div className="card-footer">
                    <div className="button-group">
                      <button
                        className="practice-button"
                        onClick={() => navigate(`/universites/${universiteId}/matieres/${matiereId}/egzamen/${examen.id}/pratike`)}
                      >
                        <span className="button-icon">📖</span>
                        <span className="button-text">Etidye</span>
                        <span className="button-arrow">→</span>
                      </button>
                      <button
                        className="quiz-button"
                        onClick={() => navigate(`/universites/${universiteId}/matieres/${matiereId}/egzamen/${examen.id}/quiz`)}
                      >
                        <span className="button-icon">🎯</span>
                        <span className="button-text">Teste</span>
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

export default Antrenman;
