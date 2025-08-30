import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";

function AjouteMatiere() {
  const [universites, setUniversites] = useState([]);
  const [universiteId, setUniversiteId] = useState("");
  const [matiereNom, setMatiereNom] = useState("");
  const [departement, setDepartement] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Charger la liste des universités au chargement du composant
  useEffect(() => {
    const fetchUniversites = async () => {
      const querySnapshot = await getDocs(collection(db, "universites"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUniversites(list);
    };
    fetchUniversites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const universite = universites.find(u => u.id === universiteId);
    if (!universiteId || !matiereNom) {
      setMessage("Veuillez choisir une université et entrer le nom de la matière.");
      setLoading(false);
      return;
    }
    if (universite?.nom === 'CHCL' && !departement) {
      setMessage("Veuillez choisir un département pour CHCL.");
      setLoading(false);
      return;
    }
    try {
      await addDoc(collection(db, "matieres"), {
        nom: matiereNom,
        universiteId,
        universiteNom: universite ? universite.nom : "",
        departement: departement || "",
        createdAt: new Date(),
      });
      setMessage("Matière ajoutée avec succès !");
      setMatiereNom("");
      setUniversiteId("");
      setDepartement("");
    } catch (err) {
      setMessage("Erreur : " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 2px 12px #0001" }}>
      <h2 style={{ textAlign: "center", color: "#1e5bbf" }}>Ajouter une Matière</h2>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <a href="/ajoute-examen" style={{
          color: '#1e5bbf',
          textDecoration: 'underline',
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: '4px',
          border: '1px solid #1e5bbf',
          marginRight: 10
        }}>
          ➕ Ajoute yon Egzamen/Quiz
        </a>
      </div>
      <form onSubmit={handleSubmit}>
        <select value={universiteId} onChange={e => setUniversiteId(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="">-- Choisir une université --</option>
          {universites.map(u => (
            <option key={u.id} value={u.id}>{u.nom}</option>
          ))}
        </select>
        <input value={matiereNom} onChange={e => setMatiereNom(e.target.value)} placeholder="Nom de la matière" required style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        {universites.find(u => u.id === universiteId)?.nom === 'CHCL' && (
          <select value={departement} onChange={e => setDepartement(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
            <option value="">-- Chwazi depatman --</option>
            <option value="ST">ST (Syans ak Teknoloji)</option>
            <option value="SH">SH (Syans ak Imen)</option>
          </select>
        )}
        <button type="submit" disabled={loading} style={{ width: "100%", background: "#1e5bbf", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Ajout..." : "Ajouter la Matière"}
        </button>
      </form>
      {message && <div style={{ marginTop: 16, color: message.startsWith("Erreur") ? "#e74c3c" : "#27ae60", textAlign: "center" }}>{message}</div>}
    </div>
  );
}

export default AjouteMatiere; 