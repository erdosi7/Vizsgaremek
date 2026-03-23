import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUser(payload);
      } catch (e) {
        console.log('Token dekódolási hiba:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.querySelector('.home-header');
      if (headerElement) {
        if (window.scrollY > 50) {
          headerElement.style.padding = '0';
          headerElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
          headerElement.style.padding = '0';
          headerElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && accountToggleRef.current) {
        if (!dropdownRef.current.contains(e.target) && e.target !== accountToggleRef.current && !accountToggleRef.current.contains(e.target)) {
          setIsAccountDropdownActive(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleNavLinkClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsAccountDropdownActive(!isAccountDropdownActive);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  return (
    <>
      <header className="home-header">
        <div className="home-header-container">
          <a href="/" className="home-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="home-logo-icon"></div>
            <div className="home-logo-text">BetonLogisztika</div>
          </a>
          <ul className="home-nav-menu">
            <li className="home-nav-item">
              <a href="/" className="home-nav-link active" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="home-nav-item">
              <a href="/megrendeles" className="home-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="home-nav-item">
              <a href="/ajanlatkeres" className="home-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="home-nav-item">
              <a href="/kapcsolat" className="home-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="home-nav-item">
              <a href="/partnereink" className="home-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
          </ul>
          
          <div className="home-account-menu">
            <div className="home-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`home-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="home-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="home-account-content">
                
                <a href="/megrendeleim" className="home-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>
                
                <a href="/ajanlataim" className="home-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>
                
                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="home-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}
                
                <button className="home-account-menu-item home-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Professzionális betonszállítás</h1>
          <p>Gyors, megbízható és pontos betonszállítás. Minőségi anyagok, tapasztalt csapat, kiváló árak.</p>
          <a href="/ajanlatkeres" className="home-btn" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatot kérek</a>
        </div>
      </section>

      <section className="home-features">
        <h2 className="home-section-title">Miért minket válasszanak?</h2>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Gyors szállítás</h3>
            <p>Pontos időbeosztással dolgozunk, hogy megbízhatóan szállíthassuk a betont projektekhez.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <i className="fas fa-award"></i>
            </div>
            <h3>Minőségi anyagok</h3>
            <p>Kizárólag minőségének bizonyított betont használunk, amely megfelel a legmagasabb szabványoknak.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Tapasztalt csapat</h3>
            <p>Hosszú évek tapasztalatával rendelkező szakemberekből álló csapatunk áll rendelkezésére.</p>
          </div>
        </div>
      </section>

      <section className="home-about">
        <div className="home-about-highlights">
          <div className="home-highlight-item">
            <h4>100% Megbízhatóság</h4>
            <p>Időben és precízen</p>
          </div>
          <div className="home-highlight-item">
            <h4>Minőség 2005 óta</h4>
            <p>15+ év tapasztalat</p>
          </div>
        </div>
        
        <div className="home-about-container">
          <div className="home-about-content">
            <h2>Bemutatkozás</h2>
            <p>A BetonLogisztika Kft. 2005 óta működik a betonszállítás és -keverés területén. Célunk, hogy a legjobb minőségű betont szállítsuk ügyfeleinknek, pontosan és időben.</p>
            
            <p>Flottánk modern, jól felszerelt betonszállító keverőkocsikból áll, amelyek lehetővé teszik számunkra a gyors és hatékony munkavégzést akár kis, akár nagy volumenű projektek esetén is.</p>
            <p>Tapasztalt csapatunk garantálja, hogy minden megrendelést precízen és profi módon teljesítünk, legyen szó lakóépületről, ipari létesítményről vagy infrastrukturális projektől.</p>
            
            <div className="home-stats">
              <div className="home-stat-item">
                <div className="home-stat-number">15+</div>
                <div className="home-stat-text">Év tapasztalat</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-number">500+</div>
                <div className="home-stat-text">Elkészült projekt</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-number">100%</div>
                <div className="home-stat-text">Elégedett ügyfél</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-number">24/7</div>
                <div className="home-stat-text">Ügyfél-támogatás</div>
              </div>
            </div>
          </div>
          <div className="home-about-image">
            <img src="/images/betonlogisztika-alapbetonozas-hegyoldal.jpg" alt="BetonLogisztika munkák" />
          </div>
        </div>
      </section>

      <section className="home-beton-special">
  <h2 className="home-section-title">Beton típusok</h2>
  <div className="home-beton-special-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
    
    
    <div className="home-beton-card">
      <div className="home-beton-img" style={{backgroundImage: "url('/images/tomorbeton.png')"}}></div>
      <div className="home-beton-content">
        <h3>Tömörbeton</h3>
        <p>Alacsony szilárdságú, tömör szerkezetű beton. Alkalmas alapozásokhoz, járófelületekhez, nem teherhordó szerkezetekhez és feltöltésekhez.</p>
      </div>
    </div>
    
    
    <div className="home-beton-card">
      <div className="home-beton-img" style={{backgroundImage: "url('/images/alapbeton.png')"}}></div>
      <div className="home-beton-content">
        <h3>Alapbeton</h3>
        <p>Alapozásokhoz, padlókhoz és egyszerűbb szerkezetekhez ajánlott általános célú beton. Megbízható és gazdaságos megoldás.</p>
      </div>
    </div>
    
  
    <div className="home-beton-card">
      <div className="home-beton-img" style={{backgroundImage: "url('/images/szerkezeti.png')"}}></div>
      <div className="home-beton-content">
        <h3>Szerkezeti beton</h3>
        <p>Általános építkezésekhez használt közepes szilárdságú beton. Födémekhez, oszlopokhoz, gerendákhoz és teherhordó szerkezetekhez.</p>
      </div>
    </div>
    
   
    <div className="home-beton-card">
      <div className="home-beton-img" style={{backgroundImage: "url('/images/magas.png')"}}></div>
      <div className="home-beton-content">
        <h3>Magas szilárdságú beton</h3>
        <p>Ipari létesítményekhez, nagy terhelésű padlókhoz és speciális szerkezetekhez ajánlott. Kiemelkedő tartósság és teherbírás.</p>
      </div>
    </div>
    
  
    <div className="home-beton-card">
      <div className="home-beton-img" style={{backgroundImage: "url('/images/vasbeton.png')"}}></div>
      <div className="home-beton-content">
        <h3>Vasbeton</h3>
        <p>Vasbeton szerkezetekhez, hidakhoz, tartályokhoz és nagy igénybevételű építményekhez. Kiváló minőség, hosszú élettartam.</p>
      </div>
    </div>
    

    <div className="home-beton-card">
      <div className="home-beton-img" style={{backgroundImage: "url('/images/nagy.png')"}}></div>
      <div className="home-beton-content">
        <h3>Nagy szilárdságú beton</h3>
        <p>Speciális, extrém terhelésű szerkezetekhez, magasépítéshez és infrastrukturális projektekhez. A legmagasabb minőségi követelményeknek is megfelel.</p>
      </div>
    </div>
    
  </div>
</section>

     
      <footer className="home-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8315 Meleghegyi utca 5., Gyenesdiás | <a href="tel:+36309973432">+36 30 997 3432</a> | <a href="mailto:info@betonlogisztika.hu">info@betonlogisztika.hu</a></p>

        <div className="home-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a> | 
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a> | 
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="home-social-icons">
          <a href="https://www.facebook.com/betonlogisztika/"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="home-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;