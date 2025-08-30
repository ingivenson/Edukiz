 import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import "../css/AjouteExamen.css";
import questionsChimie2020 from "../data/questions_chimie_2020.json";
import questionsChimie2021 from "../data/questions_chimie_2021.json";
import questionsChimie2021Octobre from "../data/questions_chimie_2021_octobre.json";
import questionsChimie2022 from "../data/questions_chimie_2022.json";
import questionsBiologie2016 from "../data/questions_biologie_2016.json";
import questionsBiologie2017 from "../data/questions_biologie_2017.json";
import questionsBiologie2020 from "../data/questions_biologie_2020.json";
import questionsBiologie2021 from "../data/questions_biologie_2021.json";
import questionsBiologie2021Octobre from "../data/questions_biologie_2021_octobre.json";
import questionsBiologie2022 from "../data/questions_biologie_2022.json";
import questionsKonesansJeneral from "../data/questions_konesans_jeneral.json";
import questionsKonesans2021 from "../data/questions_konesans_2021.json";
import questionsFizik2018 from "../data/questions_fizik_2018.json";
import questionsCultureGenerale2020 from "../data/questions_culture_generale_2020.json";
import questionsCultureGenerale2018 from "../data/questions_culture_generale_2018.json";
import questionsKonesans2017 from "../data/questions_konesans_2017.json";

// Fonksyon pou jere repons miltip yo
const formatReponsKorek = (repons) => {
  if (!repons) return [];
  if (Array.isArray(repons)) return repons;
  if (typeof repons === "string") {
    if (repons.includes(",")) return repons.split(",");
    return [repons];
  }
  return [];
};

function AjouteExamen() {
  const navigate = useNavigate();

  // Universités/Matières
  const [universites, setUniversites] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [universiteId, setUniversiteId] = useState("");
  const [matiereId, setMatiereId] = useState("");

  // Métadonnées Examen
  const [nom, setNom] = useState("");
  const [annee, setAnnee] = useState("");
  const [duree, setDuree] = useState("");

  // Questions builder
  const emptyQcm = { type: "qcm", texte: "", choix: ["", "", "", ""], correct: [] };
  const [questions, setQuestions] = useState([emptyQcm]);

  // UI state
  const [loading, setLoading] = useState(false);

  // Load Universités at mount
  useEffect(() => {
    const fetchUniversites = async () => {
      try {
        const snap = await getDocs(collection(db, "universites"));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUniversites(list);
      } catch (e) {
        console.error(e);
        alert("Erreur chajman inivèsite yo.");
      }
    };
    fetchUniversites();
  }, []);

  // Load Matieres when universiteId changes
  useEffect(() => {
    const fetchMatieres = async () => {
      if (!universiteId) { setMatieres([]); setMatiereId(""); return; }
      try {
        const q = query(collection(db, "matieres"), where("universiteId", "==", universiteId));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMatieres(list);
        setMatiereId("");
      } catch (e) {
        console.error(e);
        alert("Erreur chajman matyè yo.");
      }
    };
    fetchMatieres();
  }, [universiteId]);

  const selectedUniversite = useMemo(() => universites.find(u => u.id === universiteId), [universites, universiteId]);
  const selectedMatiere = useMemo(() => matieres.find(m => m.id === matiereId), [matieres, matiereId]);

  // Handlers Questions
  const addQuestion = () => setQuestions(prev => [...prev, { ...emptyQcm }]);
  const removeQuestion = (idx) => setQuestions(prev => prev.filter((_, i) => i !== idx));

  const updateQuestion = (idx, patch) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== idx) return q;
      const newQ = { ...q, ...patch };
      // Si se yon kesyon konplete, prepare tèks la
      if (newQ.type === "konplete" && newQ.texte) {
        // Ranplase [blank] ak ___ (3 underscore)
        if (!newQ.texte.includes("___")) {
          newQ.texte = newQ.texte.replace(/\[blank\]/g, "___");
        }
      }
      return newQ;
    }));
  };

  const changeType = (idx, type) => {
    if (type === "qcm") {
      updateQuestion(idx, { type, texte: "", choix: ["", "", "", ""], correct: [] });
    } else if (type === "vrai_faux") {
      updateQuestion(idx, { type, texte: "", choix: undefined, correct: "vrai" });
    } else if (type === "konplete") {
      updateQuestion(idx, { type, texte: "", choix: undefined, correct: "" });
    } else { // "ouve"
      updateQuestion(idx, { type, texte: "", choix: undefined, correct: "" });
    }
  };

  const addChoice = (qIdx) => {
    const q = questions[qIdx];
    if (!q || q.type !== "qcm") return;
    const newChoix = [...(q.choix || [])];
    newChoix.push("");
    updateQuestion(qIdx, { choix: newChoix });
  };

  const removeChoice = (qIdx, cIdx) => {
    const q = questions[qIdx];
    if (!q || q.type !== "qcm") return;
    const newChoix = (q.choix || []).filter((_, i) => i !== cIdx);
    let newCorrect = Array.isArray(q.correct) ? q.correct.filter(v => v !== String(cIdx)) : [];
    // Reindex correct selections after removal
    newCorrect = newCorrect.map(v => {
      const num = parseInt(v, 10);
      return String(num > cIdx ? num - 1 : num);
    });
    updateQuestion(qIdx, { choix: newChoix, correct: newCorrect });
  };

  const toggleCorrectQcm = (qIdx, cIdx) => {
    const q = questions[qIdx];
    if (!q || q.type !== "qcm") return;
    const key = String(cIdx);
    const setArr = new Set(Array.isArray(q.correct) ? q.correct : []);
    if (setArr.has(key)) setArr.delete(key); else setArr.add(key);
    updateQuestion(qIdx, { correct: Array.from(setArr).sort((a,b) => Number(a)-Number(b)) });
  };

  const validate = () => {
    if (!universiteId) return "Tanpri chwazi yon inivèsite.";
    if (!matiereId) return "Tanpri chwazi yon matyè.";
    if (!annee || isNaN(Number(annee))) return "Tanpri antre ane a (nimewo).";
    if (!questions.length) return "Ajoute omwen yon kesyon.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.texte || !String(q.texte).trim()) return `Kesyon #${i+1} pa gen tèks.`;
      if (q.type === "qcm") {
        const choix = q.choix || [];
        if (choix.length < 2) return `Kesyon #${i+1}: mete omwen 2 chwa.`;
        if (!(Array.isArray(q.correct) && q.correct.length > 0)) return `Kesyon #${i+1}: chwazi repons kòrèk yo.`;
        for (let c = 0; c < choix.length; c++) {
          if (!String(choix[c]).trim()) return `Kesyon #${i+1}: chwa #${c+1} vid.`;
        }
      }
      if (q.type === "vrai_faux") {
        if (q.correct !== "vrai" && q.correct !== "faux") return `Kesyon #${i+1}: chwazi Vrai/Faux.`;
      }
      if (q.type === "konplete") {
        if (!q.correct || (Array.isArray(q.correct) && q.correct.length === 0) || (typeof q.correct === "string" && !q.correct.trim())) {
          return `Kesyon #${i+1}: mete repons korek la.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }

    setLoading(true);
    try {
      const payloadQuestions = questions.map(q => {
        if (q.type === "qcm") {
          const reponsKorek = (Array.isArray(q.correct) ? q.correct : []).sort((a, b) => Number(a) - Number(b)).join(",");
          return {
            type: "qcm",
            texte: q.texte,
            choix: q.choix,
            reponsKorek,
          };
        }
        if (q.type === "vrai_faux") {
          return {
            type: "vrai_faux",
            texte: q.texte,
            reponsKorek: q.correct === "vrai" ? "vrai" : "faux",
          };
        }
        if (q.type === "konplete") {
          return {
            type: "konplete",
            texte: q.texte,
            reponsKorek: Array.isArray(q.correct) ? q.correct : [q.correct],
          };
        }
        return {
          type: "ouve",
          texte: q.texte,
          reponsKorek: "",
        };
      });

      const docData = {
        universiteId,
        matiereId,
        universite: selectedUniversite?.nom || "",
        matiere: selectedMatiere?.nom || "",

        nom: nom ? nom.trim() : "",
        annee: Number(annee),
        duree: duree ? Number(duree) : null,
        createdAt: new Date(),
        questions: payloadQuestions,
      };

      await addDoc(collection(db, "examens"), docData);
      alert("✅ Egzamen/Quiz ajoute ak siksè !");
      setNom("");
      setAnnee("");
      setDuree("");
      setUniversiteId("");
      setMatiereId("");
      setMatieres([]);
      setQuestions([{ ...emptyQcm }]);
    } catch (e) {
      console.error(e);
      alert("❌ Pa rive anrejistre egzamen an.");
    } finally {
      setLoading(false);
    }
  };

  // Prefill functions...
  const prefillChimi2020 = () => {
    setUniversiteId("universite_chimi_id");
    setMatiereId("matiere_chimi_id");
    setNom("Examen Chimie 2020");
    setAnnee(2020);
    setQuestions(
      questionsChimie2020.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillChimi2021 = () => {
    setUniversiteId("universite_chimi_id");
    setMatiereId("matiere_chimi_id");
    setNom("Examen Chimie 2021");
    setDuree(60);
    setAnnee(2021);
    setQuestions(
      questionsChimie2021.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillChimi2021Octobre = () => {
    setUniversiteId("universite_chimi_id");
    setMatiereId("matiere_chimi_id");
    setNom("Examen Chimie Octobre 2021");
    setAnnee(2021);
    setQuestions(
      questionsChimie2021Octobre.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillChimi2022 = () => {
    setUniversiteId("universite_chimi_id");
    setMatiereId("matiere_chimi_id");
    setNom("Concours Admission Chimie 2022");
    setAnnee(2022);
    setQuestions(
      questionsChimie2022.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillBiologie2016 = () => {
    setUniversiteId("universite_bio_id");
    setMatiereId("matiere_bio_id");
    setNom("Examen Biologie 2016");
    setAnnee(2016);
    setQuestions(
      questionsBiologie2016.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillBiologie2017 = () => {
    setUniversiteId("universite_bio_id");
    setMatiereId("matiere_bio_id");
    setNom("Concours Admission Biologie 2017");
    setAnnee(2017);
    setQuestions(
      questionsBiologie2017.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillBiologie2020 = () => {
    setUniversiteId("universite_bio_id");
    setMatiereId("matiere_bio_id");
    setNom("Concours Admission Biologie 2020");
    setAnnee(2020);
    setDuree(60);
    setQuestions(
      questionsBiologie2020.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillBiologie2021 = () => {
    setUniversiteId("universite_bio_id");
    setMatiereId("matiere_bio_id");
    setNom("Concours Admission Biologie 2021");
    setAnnee(2021);
    setDuree(60);
    setQuestions(
      questionsBiologie2021.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillBiologie2021Octobre = () => {
    setUniversiteId("universite_bio_id");
    setMatiereId("matiere_bio_id");
    setNom("Examen Biologie Octobre 2021");
    setAnnee(2021);
    setQuestions(
      questionsBiologie2021Octobre.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillBiologie2022 = () => {
    setUniversiteId("universite_bio_id");
    setMatiereId("matiere_bio_id");
    setNom("Examen Biologie 2022");
    setAnnee(2022);
    setQuestions(
      questionsBiologie2022.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillKonesansJeneral = () => {
    setUniversiteId("universite_kj_id");
    setMatiereId("matiere_kj_id");
    setNom("Tès Konesans Jeneral");
    setAnnee(new Date().getFullYear());
    setQuestions(
      questionsKonesansJeneral.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  // NOUVO PREFILL 2021
  const prefillKonesans2021 = () => {
    setUniversiteId("universite_kj_id");
    setMatiereId("matiere_kj_id");
    setNom("Tès Konesans Jeneral 2021");
    setAnnee(2021);
    const source = Array.isArray(questionsKonesans2021)
      ? questionsKonesans2021
      : (questionsKonesans2021.questions || []);
    setQuestions(
      source.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  // NOUVO PREFILL 2017
  const prefillKonesans2017 = () => {
    setUniversiteId("universite_kj_id");
    setMatiereId("matiere_kj_id");
    setNom("Tès Konesans Jeneral 2017");
    setAnnee(2017);
    setQuestions(
      questionsKonesans2017.map((question) => ({
        ...question
        // Pa gen besoin de correct paske estrikti ou a ka gen konplete-multi, tabl, elatriye
      }))
    );
  };

  const prefillFizik2018 = () => {
    setUniversiteId("universite_fizik_id");
    setMatiereId("matiere_fizik_id");
    setNom("Concours d'Admission Physique Septembre 2018");
    setAnnee(2018);
    setQuestions(
      questionsFizik2018.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillCultureGenerale2020 = () => {
    setUniversiteId("universite_cg_id");
    setMatiereId("matiere_cg_id");
    setNom("Culture Générale Janvier 2020");
    setAnnee(2020);
    setQuestions(
      questionsCultureGenerale2020.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const prefillCultureGenerale2018 = () => {
    setUniversiteId("universite_cg_id");
    setMatiereId("matiere_cg_id");
    setNom("Culture Générale 2018 (Concours Admission)");
    setAnnee(2018);
    setQuestions(
      questionsCultureGenerale2018.map((question) => ({
        ...question,
        correct: formatReponsKorek(question.reponsKorek)
      }))
    );
  };

  const saveQuestionsToDatabase = async () => {
    try {
      setLoading(true);
      const payloadQuestions = questions.map(q => {
        if (q.type === "qcm") {
          const reponsKorek = (Array.isArray(q.correct) ? q.correct : []).sort((a, b) => Number(a) - Number(b)).join(",");
          return {
            type: "qcm",
            texte: q.texte,
            choix: q.choix,
            reponsKorek,
          };
        }
        if (q.type === "vrai_faux") {
          return {
            type: "vrai_faux",
            texte: q.texte,
            reponsKorek: q.correct === "vrai" ? "vrai" : "faux",
          };
        }
        if (q.type === "konplete") {
          return {
            type: "konplete",
            texte: q.texte,
            reponsKorek: Array.isArray(q.correct) ? q.correct : [q.correct],
          };
        }
        return {
          type: "ouve",
          texte: q.texte,
          reponsKorek: "",
        };
      });

      await addDoc(collection(db, "questions"), { questions: payloadQuestions });
      alert("✅ Kesyon yo ak repons yo sove nan baz done a avèk siksè!");
    } catch (e) {
      console.error(e);
      alert("❌ Pa rive sove kesyon yo nan baz done a.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <button
        onClick={() => navigate(-1)}
        className="button"
      >
        ← Tounen
      </button>

      <div className="form-container">
        <h2 className="form-header">Ajoute yon Egzamen / Kiz</h2>

        <form onSubmit={handleSubmit}>
          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Inivèsite</label>
              <select
                value={universiteId}
                onChange={e => setUniversiteId(e.target.value)}
                required
                className="select-field"
              >
                <option value="">-- Chwazi inivèsite --</option>
                {universites.map(u => (
                  <option key={u.id} value={u.id}>{u.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Matyè</label>
              <select
                value={matiereId}
                onChange={e => setMatiereId(e.target.value)}
                required
                disabled={!universiteId}
                className="select-field"
              >
                <option value="">-- Chwazi matyè --</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Non (opsyonèl)</label>
              <input
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Egzamen Janvye/ Mid-term / Chapit 3 ..."
                style={{ width: "100%", marginTop: 6, marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Ane</label>
              <input
                type="number"
                value={annee}
                onChange={e => setAnnee(e.target.value)}
                placeholder="2025"
                required
                style={{ width: "100%", marginTop: 6, marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Dire (min) - opsyonèl</label>
              <input
                type="number"
                value={duree}
                onChange={e => setDuree(e.target.value)}
                placeholder="60"
                style={{ width: "100%", marginTop: 6, marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          {/* Pré-remplissage buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={prefillKonesansJeneral}
              style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Tès Konesans Jeneral
            </button>
            {/* NOUVO BOUTON KONESANS 2021 */}
            <button
              type="button"
              onClick={prefillKonesans2021}
              style={{ background: "#f59e42", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Tès Konesans 2021
            </button>
            {/* NOUVO BOUTON KONESANS 2017 */}
            <button
              type="button"
              onClick={prefillKonesans2017}
              style={{ background: "#f472b6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Tès Konesans Jeneral 2017
            </button>
            <button
              type="button"
              onClick={prefillChimi2020}
              style={{ background: "#34d399", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak egzamen Chimie 2020
            </button>
            <button
              type="button"
              onClick={prefillChimi2021}
              style={{ background: "#34d399", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak egzamen Chimie 2021
            </button>
            <button
              type="button"
              onClick={prefillChimi2021Octobre}
              style={{ background: "#34d399", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak egzamen Chimie Octobre 2021
            </button>
            <button
              type="button"
              onClick={prefillChimi2022}
              style={{ background: "#34d399", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Concours Chimie 2022
            </button>
            <button
              type="button"
              onClick={prefillBiologie2016}
              style={{ background: "#60a5fa", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak egzamen Biologie 2016
            </button>
            <button
              type="button"
              onClick={prefillBiologie2017}
              style={{ background: "#60a5fa", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Concours Biologie 2017
            </button>
            <button
              type="button"
              onClick={prefillBiologie2020}
              style={{ background: "#60a5fa", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Concours Biologie 2020
            </button>
            <button
              type="button"
              onClick={prefillBiologie2021}
              style={{ background: "#60a5fa", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >

              Pré-remplir ak Concours Biologie 2021
            </button>
            <button
              type="button"
              onClick={prefillBiologie2021Octobre}
              style={{ background: "#60a5fa", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Egzamen Biologie Octobre 2021
            </button>
            <button
              type="button"
              onClick={prefillBiologie2022}
              style={{ background: "#60a5fa", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Egzamen Biologie 2022
            </button>
            <button
              type="button"
              onClick={prefillFizik2018}
              style={{ background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Concours Physique 2018
            </button>
            <button
              type="button"
              onClick={prefillCultureGenerale2020}
              style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Culture Générale 2020
            </button>
            <button
              type="button"
              onClick={prefillCultureGenerale2018}
              style={{ background: "#fbbf24", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
            >
              Pré-remplir ak Culture Générale 2018
            </button>
          </div>

          {/* Questions */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Kesyon yo</h3>
              <button type="button" onClick={addQuestion} className="add-question-button">+ Ajoute kesyon</button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="question-container">
                <div className="question-header">
                  <span style={{ fontWeight: 700, color: '#1e5bbf' }}>#{idx + 1}</span>
                  <select
                    value={q.type}
                    onChange={e => changeType(idx, e.target.value)}
                    className="select-field"
                  >
                    <option value="qcm">QCM</option>
                    <option value="vrai_faux">Vrai / Faux</option>
                    <option value="konplete">Konplete</option>
                    <option value="ouve">Ouvè (san koreksyon otomatik)</option>
                  </select>

                  <button type="button" onClick={() => removeQuestion(idx)} style={{ marginLeft: 'auto', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 600 }}>Retire</button>
                </div>

                {/* Texte */}
                <div style={{ marginTop: 10 }}>
                  <textarea
                    value={q.texte}
                    onChange={e => updateQuestion(idx, { texte: e.target.value })}
                    placeholder="Tèks kesyon an ..."
                    rows={3}
                    className="textarea"
                  />
                </div>

                {/* QCM */}
                {q.type === 'qcm' && (
                  <div style={{ marginTop: 8 }}>
                    {(q.choix || []).map((ch, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <input
                          type="checkbox"
                          checked={Array.isArray(q.correct) ? q.correct.includes(String(cIdx)) : false}
                          onChange={() => toggleCorrectQcm(idx, cIdx)}
                          title="Kòrèk?"
                        />
                        <span style={{ fontWeight: 700, width: 22 }}>{String.fromCharCode(65 + cIdx)}.</span>
                        <input
                          value={ch}
                          onChange={e => {
                            const newChoix = [...(q.choix || [])];
                            newChoix[cIdx] = e.target.value;
                            updateQuestion(idx, { choix: newChoix });
                          }}
                          placeholder={`Chwa ${cIdx + 1}`}
                          style={{ flex: 1, borderRadius: 8, border: '1px solid #d1d5db', padding: '8px 10px' }}
                        />
                        <button type="button" onClick={() => removeChoice(idx, cIdx)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>✖</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addChoice(idx)} style={{ marginTop: 4, background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 600 }}>+ Ajoute chwa</button>
                    <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>Ou ka seleksyone plizyè repons kòrèk. Yo pral sove kòm endis 0,1,2...</div>
                  </div>
                )}

                {/* Vrai/Faux */}
                {q.type === 'vrai_faux' && (
                  <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="radio" name={`vf_${idx}`} checked={q.correct === 'vrai'} onChange={() => updateQuestion(idx, { correct: 'vrai' })} /> Vrai
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="radio" name={`vf_${idx}`} checked={q.correct === 'faux'} onChange={() => updateQuestion(idx, { correct: 'faux' })} /> Faux
                    </label>
                  </div>
                )}

                {/* Konplete */}
                {q.type === 'konplete' && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 8 }}>
                      Ekri [blank] nan tèks kesyon an kote ou vle mete espas pou konplete a. Li pral parèt kòm ___ lè kesyon an afiche.
                    </div>
                    <input
                      value={q.correct || ''}
                      onChange={e => updateQuestion(idx, { correct: e.target.value })}
                      placeholder="Repons kòrèk la"
                      style={{ width: '100%', borderRadius: 8, border: '1px solid #d1d5db', padding: '8px 10px' }}
                    />
                  </div>
                )}

                {/* Ouvè: no correct input */}
                {q.type === 'ouve' && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                    Kesyon ouvè. Pa gen repons kòrèk otomatik; yo pral korije manyèlman.
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Ap anrejistre...' : 'Enrejistre Egzamen / Kiz'}
          </button>
        </form>

        {/* Save questions button */}
        <button
          type="button"
          onClick={saveQuestionsToDatabase}
          style={{ marginTop: 16, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}
        >
          Sove Kesyon yo nan Baz Done
        </button>
      </div>
    </div>
  );
}

export default AjouteExamen;