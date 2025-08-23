import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

function ExamensMatiere() {
  const { universiteId, matiereId } = useParams();
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matiereNom, setMatiereNom] = useState("");
  const [annees, setAnnees] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState("");
  const [imageToShow, setImageToShow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Chache tout egzamen pou matyè sa a ak inivèsite sa a
      const q = query(collection(db, "examens"), where("universiteId", "==", universiteId), where("matiereId", "==", matiereId));
      const querySnapshot = await getDocs(q);
      const examensList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExamens(examensList);
      // Chache tout ane diferan
      const uniqueAnnees = Array.from(new Set(examensList.map(ex => ex.annee))).sort((a, b) => b - a);
      setAnnees(uniqueAnnees);
      // Chache non matyè a
      const matSnap = await getDocs(query(collection(db, "matieres"), where("id", "==", matiereId)));
      if (!matSnap.empty) {
        setMatiereNom(matSnap.docs[0].data().nom || "");
      }
      setLoading(false);
    };
    fetchData();
  }, [universiteId, matiereId]);

  const examensFiltre = selectedAnnee
    ? examens.filter(ex => ex.annee === Number(selectedAnnee) || ex.annee === selectedAnnee)
    : [];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#183a6d", marginBottom: 18 }}>
        Egzamen pou matyè: {matiereNom}
      </h2>
      {loading ? (
        <div>Chajman...</div>
      ) : annees.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
          Pa gen egzamen pou matyè sa a.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, color: '#1e5bbf', marginRight: 10 }}>Chwazi ane:</label>
            <select
              value={selectedAnnee}
              onChange={e => setSelectedAnnee(e.target.value)}
              style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            >
              <option value="">-- Chwazi ane --</option>
              {annees.map(annee => (
                <option key={annee} value={annee}>{annee}</option>
              ))}
            </select>
          </div>
          {selectedAnnee && examensFiltre.length === 0 && (
            <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
              Pa gen egzamen pou ane sa a.
            </div>
          )}
          {selectedAnnee && examensFiltre.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
              {examensFiltre.map(ex => (
                <div key={ex.id} style={{
                  background: '#f1f6fa',
                  borderRadius: 10,
                  padding: '16px 10px',
                  fontSize: 16,
                  color: '#183a6d',
                  fontWeight: 600,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px #0001',
                  minHeight: 70,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ marginBottom: 8 }}>{ex.nom}</div>
                  {ex.description && <div style={{ fontWeight: 400, fontSize: 14, color: '#444', marginBottom: 8 }}>{ex.description}</div>}
                  <button
                    onClick={() => setImageToShow(ex.imageUrl)}
                    style={{
                      background: '#1e5bbf',
                      color: '#fff',
                      borderRadius: 6,
                      padding: '7px 16px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: 15,
                      marginTop: 6,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    👁️ Wè egzamen
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageToShow && (
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <img 
                src={imageToShow} 
                alt="Egzamen" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 600, 
                  borderRadius: 10,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }} 
              />
              <br />
              <button 
                onClick={() => setImageToShow(null)} 
                style={{ 
                  marginTop: 15,
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Retou
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExamensMatiere; 