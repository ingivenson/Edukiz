import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { UserContext } from '../UserContext';
import BottomNavbar from '../components/BottomNavbar';

// Import des styles CSS - TOUS LES FICHIERS
import '../css/HomePage.css';
import '../css/HomePage_final_fix.css';
import '../css/HomePage_text_fix.css';
import '../css/HomePage_features_fix.css';
import '../css/HomePage_complete_fix.css';

// ENPÒTE IMAJ YO NAN SRC/IMAGES/
import image1 from '../images/image1.jpg';
import image2 from '../images/image2.jpg';
import image3 from '../images/image3.jpg';

function HomePage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erè nan dekoneksyon an:', error);
    }
  };

  return (
    <div className="home-container">
      {/* Seksyon Hero ak imaj Pexels */}
      <section
        className="hero"
        role="banner"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=2)'
        }}
        aria-label="EduKiz Ayiti - Prepare pou egzamen inivèsite yo"
      >
        <div className="hero-overlay" aria-hidden="true" />

        {/* Header navigasyon */}
        <header className="hero-header">
          <div className="branding">
            <div className="logo" aria-hidden="true">
              <div className="logo-content">
                <div className="logo-book">📚</div>
                <div className="logo-flag">🇭🇹</div>
                <div className="logo-brain">🧠</div>
              </div>
            </div>
            <div>
              <h1 className="brand-title">EduKiz Ayiti</h1>
              <p className="brand-subtitle">Vre kesyon, vre siksè!</p>
            </div>
          </div>

          <div className="actions">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-secondary" aria-label="Ale nan paj koneksyon">
                  🔑 Konekte
                </Link>
                <Link to="/register" className="btn btn-primary" aria-label="Kreye kont gratis">
                  ✨ Kreye kont
                </Link>
              </>
            ) : (
              <>
                <div className="user-chip" aria-label="Itilizatè konekte">
                  👋 {user.displayName || user.email?.split('@')[0]}
                </div>
                <button type="button" onClick={handleLogout} className="btn btn-danger" aria-label="Dekonekte">
                  🚪 Soti
                </button>
              </>
            )}
          </div>
        </header>

        {/* Kontni Hero */}
        <div className="hero-content">
          <h2 className="hero-title">Antre nan inivèsite rèv ou a ak EduKiz</h2>
          <p className="hero-text">
            Pratike ak <strong>vre kesyon egzamen ki pase deja</strong> nan inivèsite yo ann Ayiti.
            <strong>Vre kesyon, vre siksè!</strong> Idantifye feblès ou, metrize matyè yo ak kesyon otantik, 
            epi ogmante chans siksè ou.
          </p>

          <div className="hero-cta">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-accent" aria-label="Kreye kont gratis">
                  🚀 Kreye kont gratis
                </Link>
                <Link to="/login" className="btn btn-outline" aria-label="Konekte si ou gen kont deja">
                  🔑 Konekte
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => navigate('/universites')}
                  aria-label="Kòmanse fè kiz yo"
                >
                  🎯 Kòmanse Kiz Ou
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/dashboard')}
                  aria-label="Ale sou tablo panel ou"
                >
                  📊 Dashboard Ou
                </button>
              </>
            )}
          </div>

          <div className="stats" aria-label="Estatistik kle EduKiz">
            <div className="stat">
              <div className="stat-value">5K+</div>
              <div className="stat-label">Kesyon Vre</div>
            </div>
            <div className="stat">
              <div className="stat-value">15+</div>
              <div className="stat-label">Inivèsite</div>
            </div>
            <div className="stat">
              <div className="stat-value">90%</div>
              <div className="stat-label">Siksè</div>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVO SEKSYON: Pwoblèm ak Angajman */}
      <section className="problem-engagement">
        <div className="section-header">
          <h3 className="section-title">Poukisa EduKiz Ayiti?</h3>
          <p className="section-subtitle">
            Kòm yon moun ki angaje nan kominote ayisyen an, mwen wè pwoblèm yo postilan yo ap konfwonte ak mwen kreye solisyon sa a pou ede yo reyisi.
          </p>
        </div>

        <div className="problem-solution-grid">
          {/* Carte Problème */}
          <div className="problem-card">
            <div className="problem-header">
              <div className="problem-icon">⚠️</div>
              <h4 className="problem-title">Pwoblèm yo mwen wè</h4>
            </div>
            <p className="problem-content">
              Nan kominote ayisyen an, mwen wè anpil postilan ki gen kapasite men ki pa gen aksè nan bon preparasyon pou egzamen inivèsite yo. Sa kreye yon dezekilib ki afekte avni jèn yo.
            </p>
            <ul className="problem-list">
              <li>Postilan nan pwovens yo pa gen menm chans ak moun ki nan Pòtoprens yo</li>
              <li>Klas preparatwa yo chè ak pa aksesib pou tout moun</li>
              <li>Mank materyèl preparasyon ak vre kesyon egzamen ki soti nan ane pase yo</li>
              <li>Pa gen sistèm pou swiv pwogrè ak idantifye feblès yo</li>
              <li>Anpil moun ap etidye ak kesyon ki pa otantik oswa ki pa kòrèk</li>
              <li>Mank estrateji ak konsèy pou jere tan ak evite pyèj nan egzamen yo</li>
            </ul>
          </div>

          {/* Carte Solution/Engagement */}
          <div className="solution-card">
            <div className="solution-header">
              <div className="solution-icon">🇭🇹</div>
              <h4 className="solution-title">Angajman ak Solisyon Mwen</h4>
            </div>
            <p className="solution-content">
              Kòm yon Enjenye Enfòmatik ak moun ki soti nan kominote ayisyen an, mwen kreye EduKiz Ayiti pou bay chak postilan aksè nan preparasyon kalite ak vre kesyon egzamen yo.
            </p>
            <ul className="solution-list">
              <li>Platfòm aksesib pou tout moun, kèlkeswa kote yo rete</li>
              <li>Vre kesyon egzamen ki soti nan inivèsite yo nan ane pase yo</li>
              <li>Sistèm entèlijan pou swiv pwogrè ak bay rekòmandasyon</li>
              <li>Mòd egzamen ak menm kondisyon ak tan limite yo</li>
              <li>Estrateji ak konsèy ki soti nan ekspèyans ak rechèch</li>
              <li>Kominote postilan yo ka pataje ekspèyans ak ankouraje youn lòt</li>
              <li>Nouvo defi ak konpetisyon pou kenbe motivasyon yo</li>
            </ul>
            <div className="engagement-badge">
              <span className="flag-icon">🇭🇹</span>
              Angaje nan Kominote Ayisyen an
            </div>
          </div>
        </div>
      </section>

      {/* Kisa EduKiz ye */}
      <section className="about">
        <div className="section-header">
          <h3 className="section-title">Kisa EduKiz ye</h3>
          <p className="section-subtitle">
            EduKiz se yon platfòm aprantisaj entèraktif ki ede postilan yo prepare pou egzamen antre
            inivèsite ann Ayiti ak <strong>vre kesyon egzamen ki pase deja</strong>. 
            <strong>Vre kesyon, vre siksè!</strong> Nou rasanble kesyon otantik, 
            metòd efikas, ak pratik vize pou chak inivèsite.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <img
              className="about-img"
              src={image1}
              alt="Etidyan nwa kap etidye ak kaye ak òdinatè"
              loading="lazy"
            />
            <div className="about-content">
              <h4>Misyon nou</h4>
              <p>
                Bay chak postilan aksè nan preparasyon kalite: kèlkeswa kote li rete, li ka jwenn 
                <strong> vre kesyon egzamen</strong> ak analiz pèfòmans pou pare nèt pou jou egzamen an.
                <strong> Vre kesyon, vre siksè!</strong>
              </p>
            </div>
          </div>

          <div className="about-card">
            <img
              className="about-img"
              src={image2}
              alt="Postilan nwa ak pwofesè ap travay sou tablèt"
              loading="lazy"
            />
            <div className="about-content">
              <h4>Pou ki moun?</h4>
              <p>
                Tout postilan ki vle antre nan inivèsite piblik oswa prive ann Ayiti. Chwazi matyè ki enpòtan pou ou,
                epi pratike ak <strong>kesyon egzamen ki soti nan ane pase yo</strong> nan yon fason ki efikas.
              </p>
            </div>
          </div>

          <div className="about-card">
            <img
              className="about-img"
              src={image3}
              alt="Postilan nwa k ap itilize òdinatè pou fè egzèsis"
              loading="lazy"
            />
            <div className="about-content">
              <h4>Ki jan li mache?</h4>
              <p>
                Chwazi inivèsite ou, matyè w yo, lanse yon seri kiz ak <strong>kesyon otantik</strong>. 
                EduKiz swiv pwogrè ou, ba ou konsèy vize, epi mete w nan kondisyon egzamen vre a. 
                <strong> Vre kesyon, vre siksè!</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Karakteristik yo */}
      <section className="features">
        <div className="section-header narrow">
          <h3 className="section-title">Sa w ap jwenn sou EduKiz</h3>
          <p className="section-subtitle">Zouti ki fèt ak vre kesyon egzamen pou ede w reyisi nan egzamen yo.</p>
        </div>

        <div className="feature-grid">
          {[
            { icon: '🎯', title: 'Kesyon egzamen otantik', desc: 'Vre kesyon ki soti nan egzamen inivèsite yo ann Ayiti nan ane pase yo.' },
            { icon: '🧭', title: 'Kiz vize pa inivèsite', desc: 'Kontni ki aliyen ak modèl ak estil egzamen chak inivèsite.' },
            { icon: '⏱️', title: 'Mòd egzamen vre', desc: 'Pratike ak menm tan limite ak kondisyon egzamen yo itilize nan inivèsite yo.' },
            { icon: '📈', title: 'Siveyans pwogrè', desc: 'Idantifye fòs ak feblès ou, resevwa rekòmandasyon entèlijan.' },
            { icon: '💡', title: 'Estrateji siksè', desc: 'Konsèy pou jere tan, evite pyèj, ogmante presizyon ak vre kesyon.' },
            { icon: '🎖️', title: 'Badge ak motivasyon', desc: 'Ranmase pwen ak badge pou kenbe motivasyon ou ak vre defi yo.' }
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" aria-hidden="true">{f.icon}</div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Etap pou kòmanse */}
      <section className="steps">
        <div className="section-header narrow">
          <h3 className="section-title">3 etap pou w kòmanse</h3>
          <p className="section-subtitle">Vre kesyon, vre siksè ak etap senp yo!</p>
        </div>

        <div className="steps-grid">
          {[
            { n: '1', title: 'Kreye kont ou', desc: 'Enskri gratis epi fikse objektif ou ak inivèsite ou vize a.' },
            { n: '2', title: 'Chwazi inivèsite ak matyè', desc: 'Konsantre sou vre kesyon egzamen inivèsite ou an.' },
            { n: '3', title: 'Fè kiz ak kesyon vre', desc: 'Pratike ak vre kesyon egzamen jiskaske w pare nèt.' }
          ].map((s, idx) => (
            <div key={idx} className="step-card">
              <div className="step-n">{s.n}</div>
              <h4 className="step-title">{s.title}</h4>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="cta-row">
          {!user ? (
            <>
              <Link to="/register" className="btn btn-primary" aria-label="Kreye kont gratis">
                🚀 Kreye kont gratis
              </Link>
              <Link to="/login" className="btn btn-outline-alt" aria-label="Konekte si ou gen kont deja">
                🔑 Konekte
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => navigate('/universites')}
              aria-label="Chwazi inivèsite pou kòmanse"
            >
              🎯 Chwazi inivèsite
            </button>
          )}
        </div>
      </section>

      {/* Temwayaj ak postilan ayisyen yo */}
      <section className="testimonials">
        <div className="section-header narrow">
          <h3 className="section-title">Siksè Postilan Nou Yo</h3>
          <p className="section-subtitle">Gras ak EduKiz Ayiti, yo pase nan inivèsite yo ak yo reyisi nan konkou yo</p>
        </div>
        <div className="testimonials-grid">
          <div className="t-card">
            <p className="t-quote">
              "Gras ak EduKiz Ayiti, mwen pase nan premye ane CHCL pou medsin! Vre kesyon egzamen yo te ede m prepare nèt. 
              Mwen te pratike ak kesyon ki menm jan ak sa yo poze nan egzamen vre a. Kounye a mwen nan ane twazyèm medsin ak mwen gen bon nòt yo."
            </p>
            <div className="t-user">
              <img
                src="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
                alt="Portre Wideline, etidyan medsin ayisyen"
                loading="lazy"
              />
              <div>
                <div className="t-name">Wideline Joseph</div>
                <div className="t-meta">Etidyan Medsin — CHCL</div>
              </div>
            </div>
          </div>

          <div className="t-card">
            <p className="t-quote">
              "EduKiz Ayiti chanje lavi m! Mwen te pase nan FEL ak mwen vin pwofesè nan Fakilte Etnoloji. 
              Kesyon yo te prepare m pou tout kalite defi. Vre kesyon, vre siksè! Mwen rekòmande l bay tout postilan."
            </p>
            <div className="t-user">
              <img
                src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
                alt="Portre Jean-Baptiste, pwofesè etnoloji ayisyen"
                loading="lazy"
              />
              <div>
                <div className="t-name">Jean-Baptiste Moïse</div>
                <div className="t-meta">Pwofesè Etnoloji — FEL</div>
              </div>
            </div>
          </div>

          <div className="t-card">
            <p className="t-quote">
              "Mwen soti nan pwovens ak mwen pa t gen aksè nan klas preparatwa yo. Men ak EduKiz Ayiti, 
              mwen pase nan UPNCH ak mwen nan enjenyè kounye a. Platfòm nan ban m menm chans ak moun ki nan Pòtoprens yo."
            </p>
            <div className="t-user">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
                alt="Portre Nadia, etidyan enjenyè ayisyen"
                loading="lazy"
              />
              <div>
                <div className="t-name">Nadia Pierre-Louis</div>
                <div className="t-meta">Etidyan Enjenyè — UPNCH</div>
              </div>
            </div>
          </div>

          <div className="t-card">
            <p className="t-quote">
              "Ak EduKiz Ayiti, mwen pase nan Fakilte Agwonomi ak mwen gen yon travay nan Ministè Agrikilti a. 
              Kesyon yo te ede m konprann ki jan yo poze kesyon nan egzamen yo. Mèsi anpil EduKiz!"
            </p>
            <div className="t-user">
              <img
                src="https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
                alt="Portre Mackenson, agwonòm ayisyen"
                loading="lazy"
              />
              <div>
                <div className="t-name">Mackenson Désir</div>
                <div className="t-meta">Agwonòm — FAMV</div>
              </div>
            </div>
          </div>

          <div className="t-card">
            <p className="t-quote">
              "Gras ak EduKiz Ayiti, mwen pase nan Fakilte Dwa ak mwen kounye a nan Bawo a. 
              Vre kesyon egzamen yo te prepare m pou tout bagay. Mwen konsèye tout jèn nan kominote m nan sèvi ak EduKiz."
            </p>
            <div className="t-user">
              <img
                src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
                alt="Portre Roseline, avoka ayisyen"
                loading="lazy"
              />
              <div>
                <div className="t-name">Roseline Augustin</div>
                <div className="t-meta">Avoka — Fakilte Dwa</div>
              </div>
            </div>
          </div>

          <div className="t-card">
            <p className="t-quote">
              "EduKiz Ayiti se yon benediksyon! Mwen pase nan konkou polis ak mwen kounye a nan Akademi Polis Nasyonal la. 
              Kesyon yo te ede m prepare pou egzamen fisik ak entèlektyèl la. Vre kesyon, vre siksè!"
            </p>
            <div className="t-user">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
                alt="Portre Frantz, kadet polis ayisyen"
                loading="lazy"
              />
              <div>
                <div className="t-name">Frantz Belizaire</div>
                <div className="t-meta">Kadet Polis — APN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer ak enfòmasyon kontak yo */}
      <footer className="footer">
        <div className="footer-content">
          {/* Enfòmasyon EduKiz */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-small">
                <div className="logo-content">
                  <div className="logo-book">📚</div>
                  <div className="logo-flag">🇭🇹</div>
                  <div className="logo-brain">🧠</div>
                </div>
              </div>
              <div>
                <h4 className="footer-brand">EduKiz Ayiti</h4>
                <p className="footer-tagline">Vre kesyon, vre siksè!</p>
              </div>
            </div>
            <p className="footer-desc">
              Platfòm preparasyon #1 nan Ayiti pou egzamen inivèsite yo. 
              Nou ede postilan yo reyisi ak vre kesyon egzamen ak estrateji siksè.
            </p>
          </div>

          {/* Nouvo Defi Online */}
          <div className="footer-section">
            <h4 className="footer-title">🎯 Nouvo Defi Online</h4>
            <div className="course-info">
              <div className="course-alert">
                <span className="alert-icon">🔥</span>
                <strong>Kap Vini!</strong>
              </div>
              <p className="course-text">
                <strong>Defi ak konpetisyon online</strong> ak lòt postilan yo! Jwe ansanm, 
                konpare rezilta yo ak vin pi fò nan vre kesyon egzamen yo.
              </p>
              <div className="course-features">
                <div className="course-feature">🏆 Konpetisyon chak semèn</div>
                <div className="course-feature">🎖️ Klase ak rekonpans</div>
                <div className="course-feature">👥 Jwe ak zanmi yo</div>
                <div className="course-feature">⚡ Defi rapid ak vre kesyon</div>
              </div>
            </div>
          </div>

          {/* Enfòmasyon Developè ak Kontak */}
          <div className="footer-section">
            <h4 className="footer-title">👨‍💻 Developè ak Kontak</h4>
            <div className="developer-info">
              <div className="dev-header">
                <span className="dev-icon">🚀</span>
                <div>
                  <h5 className="dev-name">Ing. Ivenson Petit-Homme</h5>
                  <p className="dev-title">Developè Web ak Sistèm</p>
                </div>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <a href="mailto:ivensonpetithomme0@gmail.com" className="contact-link">
                    ivensonpetithomme0@gmail.com
                  </a>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <a href="tel:+50941613156" className="contact-link">
                    +509 4161-3156
                  </a>
                </div>
              </div>

              <div className="services-info">
                <h6 className="services-title">🤝 Sevis Pwofesyonèl</h6>
                <ul className="services-list">
                  <li>Devlopman sit web ak aplikasyon</li>
                  <li>Sistèm jesyon ak otomatizasyon</li>
                  <li>Konsèy teknoloji dijital</li>
                </ul>
                <p className="partnership-text">
                  <strong>Ou gen yon pwojè?</strong> Kontakte nou pou kolaborasyon!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; 2024 EduKiz Ayiti. Tout dwa rezève.</p>
              <p className="dev-credit">
                Devlope ak ❤️ pa <strong>Ing. Ivenson Petit-Homme</strong>
              </p>
            </div>
            <div className="footer-links">
              <Link to="/privacy" className="footer-link">Konfidansyalite</Link>
              <Link to="/terms" className="footer-link">Kondisyon Itilizasyon</Link>
              <Link to="/contact" className="footer-link">Kontak</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Navbar anba a */}
      <BottomNavbar />
    </div>
  );
}

export default HomePage;