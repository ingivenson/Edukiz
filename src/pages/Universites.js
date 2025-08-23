 import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import '../css/Universites.css';

function Universites() {
  const [universites, setUniversites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({}); // Track image loading errors
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversites = async () => {
      try {
        console.log("🔍 Kap chèche inivèsite yo ak foto yo...");
        const querySnapshot = await getDocs(collection(db, "universites"));
        const list = querySnapshot.docs.map(doc => {
          const data = { id: doc.id, ...doc.data() };
          console.log("📄 Inivèsite:", data.nom, "- Logo URL:", data.logoUrl || "Pa gen foto");
          return data;
        });
        
        console.log("📋 Total inivèsite yo:", list.length);
        setUniversites(list);
      } catch (error) {
        console.error("❌ Error fetching universities:", error);
      }
      setLoading(false);
    };
    fetchUniversites();
  }, []);

  // Handle image loading errors
  const handleImageError = (universityId, universityName) => {
    console.log("❌ Foto pa ka chaje pou:", universityName);
    setImageErrors(prev => ({
      ...prev,
      [universityId]: true
    }));
  };

  // Handle successful image loading
  const handleImageLoad = (universityName) => {
    console.log("✅ Foto chaje kòrèkteman pou:", universityName);
  };

  // Filtrer les universités selon le terme de recherche
  const filteredUniversites = universites.filter(u => 
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ville?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="universites-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <h3>Kap chèche inivèsite yo...</h3>
          <p>Tanpri tann yon ti kras</p>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="universites-container">
      {/* Header */}
      <button 
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        ← Tounen
      </button>

      <div className="header">
        <h1 className="title">🏛️ Chwazi Inivèsite ou</h1>
        <p className="subtitle">
          Chwazi inivèsite kote ou vle pratike ak prepare pou egzamen yo
        </p>
        {/* Debug info */}
        <small style={{color: '#666', fontSize: '12px'}}>
          {universites.length} inivèsite disponib
        </small>
      </div>

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Chèche inivèsite oswa vil..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Universities Grid */}
      {filteredUniversites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            {searchTerm ? '🔍' : '🏫'}
          </div>
          <h3 className="empty-title">
            {searchTerm ? 'Pa gen rezilta' : 'Pa gen inivèsite yo ankò'}
          </h3>
          <p className="empty-text">
            {searchTerm 
              ? `Pa gen inivèsite ki matche ak "${searchTerm}"`
              : universites.length === 0 
                ? 'Baz done a vid. Admin an bezwen ajoute inivèsite yo.'
                : 'Inivèsite yo ap chaje...'
            }
          </p>
        </div>
      ) : (
        <div className="universities-grid">
          {filteredUniversites.map((u) => (
            <div
              key={u.id}
              className="university-card"
              onClick={() => navigate(`/universites/${u.id}/matieres`)}
            >
              <div className="university-logo">
                {/* Montre foto inivèsite a depi Cloudinary si li gen youn */}
                {u.logoUrl && !imageErrors[u.id] ? (
                  <img
                    src={u.logoUrl}
                    alt={`Logo ${u.nom}`}
                    onError={() => handleImageError(u.id, u.nom)}
                    onLoad={() => handleImageLoad(u.nom)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  // Fallback emoji si pa gen foto oswa foto pa ka chaje
                  <div style={{
                    fontSize: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#1e5bbf',
                    transition: 'transform 0.3s ease',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: '12px'
                  }}>
                    🏛️
                  </div>
                )}
              </div>
              
              <h3 className="university-name">{u.nom}</h3>
              <p className="university-location">📍 {u.ville}</p>
              
              <button
                className="enter-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/universites/${u.id}/matieres`);
                }}
              >
                Antre
              </button>
            </div>
          ))}
        </div>
      )}

      <BottomNavbar />
    </div>
  );
}

export default Universites;