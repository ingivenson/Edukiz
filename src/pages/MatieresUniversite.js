 import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import BottomNavbar from "../components/BottomNavbar";
import LoadingSpinner from "../components/LoadingSpinner";
import '../css/MatieresUniversite.css';
import '../css/buttons.css';

function MatieresUniversite() {
  const { id: universiteId } = useParams();
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [universiteNom, setUniversiteNom] = useState("");
  const [selectedDepartement, setSelectedDepartement] = useState("Tout");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 Kap chèche matye yo pou inivèsite:", universiteId);
        
        // Chache matyè pou inivèsite sa a
        const q = query(collection(db, "matieres"), where("universiteId", "==", universiteId));
        const querySnapshot = await getDocs(q);
        const matieresData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log("📚 Matye yo jwenn:", matieresData.length);
        setMatieres(matieresData);
        
        // Chache non inivèsite a
        const univRef = doc(db, "universites", universiteId);
        const univSnap = await getDoc(univRef);
        if (univSnap.exists()) {
          const univData = univSnap.data();
          console.log("🏛️ Inivèsite jwenn:", univData.nom);
          setUniversiteNom(univData.nom || "Inivèsite");
        } else {
          console.log("❌ Inivèsite pa jwenn");
          setUniversiteNom("Inivèsite");
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [universiteId, navigate]);

  // Filtre matye yo selon depatman ki chwazi a (selman pou CHCL)
  const filteredMatieres = universiteNom === "CHCL" && selectedDepartement !== "Tout"
    ? matieres.filter(matiere => matiere.departement === selectedDepartement)
    : matieres;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="matieres-container">
      {/* Header Section */}
      <div className="header-section" style={{
        backgroundImage:
          'url(https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=2)'
      }}>
        <div className="header-overlay" aria-hidden="true" />
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
          <h1 className="main-title">Matye yo</h1>
          <p className="university-subtitle">{universiteNom}</p>
          
          {/* Filtre depatman pou CHCL selman */}
          {universiteNom === "CHCL" && (
            <div className="department-filters">
              <div className="filter-buttons">
                {["Tout", "ST", "SH"].map((dept) => (
                  <button
                    key={dept}
                    className={`filter-button ${selectedDepartement === dept ? 'active' : ''}`}
                    onClick={() => setSelectedDepartement(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="subjects-count">
            {filteredMatieres.length} matye disponib
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {filteredMatieres.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-circle">
                <span className="empty-icon">📖</span>
              </div>
            </div>
            <h3 className="empty-title">Pa gen matye ankò</h3>
            <p className="empty-description">
              {matieres.length === 0 
                ? "Pa gen matye ki disponib pou inivèsite sa a kounye a."
                : "Pa gen matye nan depatman sa a."
              }
              <br />
              {matieres.length === 0 && "Kontakte administratè a pou ajoute matye yo."}
            </p>
          </div>
        ) : (
          <div className="subjects-container">
            <div className="subjects-grid">
              {filteredMatieres.map((matiere, index) => (
                <div 
                  key={matiere.id} 
                  className="subject-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-header">
                    <div className="subject-icon-container">
                      <span className="subject-icon">📖</span>
                    </div>
                    <div className="card-menu">
                      <span className="menu-dots">⋯</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h3 className="subject-title">{matiere.nom}</h3>
                    <p className="subject-description">
                      Pratike ak kiz yo pou amelyore konesans ou nan matye sa a
                    </p>
                  </div>
                  
                  <div className="card-footer">
                    <button
                      className="quiz-button"
                      onClick={() => navigate(`/universites/${universiteId}/matieres/${matiere.id}/quiz-list`)}
                    >
                      <span className="button-icon">📝</span>
                      <span className="button-text">Egzamen ak Tès yo</span>
                      <span className="button-arrow">→</span>
                    </button>
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

export default MatieresUniversite;