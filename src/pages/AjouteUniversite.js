import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

function AjouteUniversite() {
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    let uploadedLogoUrl = "";
    try {
      if (!logoFile) {
        setMessage("Tanpri chwazi yon imaj pou logo a.");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("upload_preset", "unsigned_preset"); // <-- Bon upload preset
      const cloudName = "ddmfwbbrk";
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!data.secure_url) {
        setMessage("Erreur lors de l'upload sur Cloudinary : " + (data.error?.message || "Réponse invalide"));
        setLoading(false);
        return;
      }
      uploadedLogoUrl = data.secure_url || "";

      await addDoc(collection(db, "universites"), {
        nom,
        ville,
        logoUrl: uploadedLogoUrl, // Jamais undefined
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setMessage("Université enregistrée avec succès !");
      setNom(""); setVille(""); setLogoFile(null);
    } catch (err) {
      setMessage("Erreur : " + err.message);
      console.error(err);
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return <div>Chajman...</div>;
  }
  if (!user) {
    return (
      <div style={{textAlign: 'center', marginTop: 40}}>
        <h3>Ou dwe konekte pou ajoute yon inivèsite.</h3>
        <a href='/login' style={{color: '#1e5bbf', textDecoration: 'underline'}}>Ale konekte</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 2px 12px #0001" }}>
      <h2 style={{ textAlign: "center", color: "#1e5bbf" }}>Ajoute yon Inivèsite</h2>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <a href="/universites" style={{
          color: '#1e5bbf',
          textDecoration: 'underline',
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: '4px',
          border: '1px solid #1e5bbf',
          marginRight: 10
        }}>
          👁️ Wè tout Inivèsite yo
        </a>
      </div>
      <form onSubmit={handleSubmit}>
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Non inivèsite" required style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Vil" required style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        <button type="submit" disabled={loading} style={{ width: "100%", background: "#1e5bbf", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Ap anrejistre..." : "Ajoute Inivèsite"}
        </button>
      </form>
      {message && <div style={{ marginTop: 16, color: message.startsWith("Erè") || message.startsWith("Erreur") ? "#e74c3c" : "#27ae60", textAlign: "center" }}>{message}</div>}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <a href="/admin/ajoute-matiere" style={{ color: '#1e5bbf', textDecoration: 'underline', fontWeight: 600 }}>
          + Ajouter une matière pour une université
        </a>
      </div>
    </div>
  );
}

export default AjouteUniversite; 