import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AltSzerFelt.css';

const AltSzerFelt = ({ onLogout }) => {
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
      const headerElement = document.querySelector('.altSzerFelt-header');
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
      window.removeEventListener('click', handleClickOutside);
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
      <header className="altSzerFelt-header">
        <div className="altSzerFelt-header-container">
          <a href="/" className="altSzerFelt-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="altSzerFelt-logo-icon"></div>
            <div className="altSzerFelt-logo-text">BetonLogisztika</div>
          </a>
          <ul className="altSzerFelt-nav-menu">
            <li className="altSzerFelt-nav-item">
              <a href="/" className="altSzerFelt-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="altSzerFelt-nav-item">
              <a href="/megrendeles" className="altSzerFelt-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="altSzerFelt-nav-item">
              <a href="/ajanlatkeres" className="altSzerFelt-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="altSzerFelt-nav-item">
              <a href="/kapcsolat" className="altSzerFelt-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="altSzerFelt-nav-item">
              <a href="/partnereink" className="altSzerFelt-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
            <li className="altSzerFelt-nav-item">
              <a href="/alt_szer_felt" className="altSzerFelt-nav-link active" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>ÁSZF</a>
            </li>
          </ul>

          <div className="altSzerFelt-account-menu">
            <div className="altSzerFelt-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`altSzerFelt-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="altSzerFelt-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="altSzerFelt-account-content">

                <a href="/megrendeleim" className="altSzerFelt-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>

                <a href="/ajanlataim" className="altSzerFelt-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>

                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="altSzerFelt-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}

                <button className="altSzerFelt-account-menu-item altSzerFelt-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="altSzerFelt-hero">
        <div className="altSzerFelt-hero-content">
          <h1>Általános Szerződési Feltételek</h1>
          <p>A BetonLogisztika Kft. üzleti kapcsolatait szabályozó feltételek és információk</p>
        </div>
      </section>

      <section className="altSzerFelt-container">
        <div className="altSzerFelt-content">
          <div className="altSzerFelt-highlight-box">
            <p><strong>Fontos információk:</strong> Kérjük, figyelmesen olvassa el az Általános Szerződési Feltételeket. Rendelés leadásával vagy szolgáltatás igénybevételével Ön elfogadja az itt foglalt feltételeket.</p>
            <p>Utolsó frissítés: 2026. március 1.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>1. Általános rendelkezések</h2>
            <p>Ezen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a <strong>BetonLogisztika Kft.</strong> (székhely: 8360 Keszthely, Pajta alja utca 10., adószám: 12345678-2-20, cégjegyzékszám: 20-09-123456, e-mail: betonlgs@gmail.com, telefon: +36 83 123 456) és ügyfelei (a továbbiakban: Ügyfél) között létrejövő jogviszonyt szabályozzák.</p>
            <p>Az ÁSZF hatálya kiterjed a Szolgáltató által nyújtott minden betonszállítási és kapcsolódó szolgáltatásra.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>2. Rendelés menete</h2>
            <h3>2.1 Ajánlatkérés</h3>
            <p>Az Ügyfél ajánlatkérést tehet az alábbi módokon:</p>
            <ul className="altSzerFelt-list">
              <li>Online űrlap kitöltése a weboldalon</li>
              <li>Telefonos megkeresés a <strong>+36 83 123 456</strong> telefonszámon</li>
              <li>E-mail küldése a <strong>betonlgs@gmail.com</strong> címre</li>
            </ul>
            
            <h3>2.2 Ajánlat</h3>
            <p>A Szolgáltató az ajánlatkérést követően 48 órán belül részletes árajánlatot küld az Ügyfélnek, amely tartalmazza:</p>
            <ul className="altSzerFelt-list">
              <li>A szállítandó beton típusát és minőségét</li>
              <li>A mennyiséget (m³)</li>
              <li>A szállítás időpontját</li>
              <li>A teljes költséget (áfa-tartalommal)</li>
              <li>Fizetési feltételeket</li>
            </ul>
          </div>

          <div className="altSzerFelt-section">
            <h2>3. Árak és fizetési feltételek</h2>
            <h3>3.1 Árazás</h3>
            <p>Az árak forintban értendők, tartalmazzák az általános forgalmi adót (27% ÁFA). A megadott árak tájékoztató jellegűek, végleges ár csak az egyedi ajánlatban szerepel.</p>
            
            <h3>3.2 Fizetési módok</h3>
            <p>Az Ügyfél az alábbi fizetési módok közül választhat:</p>
            <ul className="altSzerFelt-list">
              <li>Átutalás a szállítást megelőzően</li>
              <li>Készpénzes fizetés a szállítás helyszínén</li>
              <li>Bankkártyás fizetés (csak előre egyeztetett esetekben)</li>
              <li>15 napos fizetési határidő (vállalati ügyfeleknek)</li>
              <li>30 napos halasztott fizetés (regisztrált partnereknek, hitelbírálat után)</li>
            </ul>
            
            <h3>3.3 Árváltozás</h3>
            <p>A Szolgáltató fenntartja a jogot az árváltoztatásra, ha a megrendelés és a szállítás között a nyersanyagárak jelentősen változnak. Ebben az esetben a Szolgáltató értesíti az Ügyfelet, aki jogosult a rendelés visszavonására kötbérfizetés nélkül.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>4. Szállítási feltételek</h2>
            <h3>4.1 Szállítási idő</h3>
            <p>A szállítás időpontja az ajánlatban meghatározott időintervallumon belül történik. A pontos időpont a szállítás napján telefonon egyeztetendő.</p>
            
            <h3>4.2 Késedelmes szállítás</h3>
            <p>Ha a Szolgáltató a megállapodott időpontot meghaladóan, több mint 2 órával késik a szállítással, az Ügyfél jogosult a rendelés értékének 5%-ának megfelelő kötbérre.</p>
            
            <h3>4.3 Fogadási feltételek</h3>
            <p>Az Ügyfél köteles biztosítani a megfelelő hozzáférési feltételeket a szállítóeszköz számára, és gondoskodni a beton megfelelő fogadásáról. A szállítási ponton legalább egy felelős személynek kell jelen lennie a fogadáshoz.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>5. Minőségi garanciák</h2>
            <p>A Szolgáltató garantálja, hogy a szállított beton megfelel a megrendelésben meghatározott minőségi követelményeknek és a vonatkozó magyar szabványoknak (MSZ 4798-1:2016).</p>
            <p>A minőségi panaszokat a szállítást követő <strong>48 órán belül</strong> kell bejelenteni a <strong>betonlgs@gmail.com</strong> címen. A panaszok vizsgálata során a Szolgáltató köteles igazolni a beton minőségét laboratóriumi vizsgálati jegyzőkönyvvel.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>6. Lemondási feltételek</h2>
            <h3>6.1 Ügyfél általi lemondás</h3>
            <p>A megrendelést a szállítást megelőzően az alábbi feltételek mellett lehet lemondani:</p>
            <ul className="altSzerFelt-list">
              <li><strong>72 óránál korábbi lemondás:</strong> díjmentes</li>
              <li><strong>48-72 óra közötti lemondás:</strong> a rendelés értékének 15%-a</li>
              <li><strong>24-48 óra közötti lemondás:</strong> a rendelés értékének 30%-a</li>
              <li><strong>24 óránál rövidebb időn belüli lemondás:</strong> a rendelés értékének 50%-a</li>
            </ul>
            
            <h3>6.2 Szolgáltató általi lemondás</h3>
            <p>A Szolgáltató jogosult a szerződéstől elállni, ha az Ügyfél fizetési kötelezettségeit nem teljesíti, vagy a szállítási feltételeket nem biztosítja.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>7. Felelősségi szabályok</h2>
            <p>A Szolgáltató felelőssége kizárólag a közvetlen kárra terjed ki, és legfeljebb a szolgáltatás értékével megegyező összegben. A Szolgáltató nem vállal felelősséget közvetett, következményes vagy nem anyagi károkért.</p>
            <p>Az Ügyfél köteles gondoskodni arról, hogy a szállítási hely megfeleljen a biztonsági előírásoknak, és a beton megfelelő módon kerüljön felhasználásra.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>8. Adatkezelés</h2>
            <p>A Szolgáltató az Ügyfél személyes adatait kizárólag a szerződés teljesítése és a kapcsolattartás céljából kezeli, az adatvédelmi törvények és az EU általános adatvédelmi rendelete (GDPR) előírásainak megfelelően.</p>
            <p>Az adatkezelés részletes szabályait az <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi Nyilatkozat</a> tartalmazza.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>9. Egyéb rendelkezések</h2>
            <h3>9.1 Joghatóság</h3>
            <p>A szerződéssel kapcsolatos minden jogvitára a magyar jog az irányadó, a viták rendezésére a Zalaegerszegi Járásbíróság rendelkezik illetékességgel.</p>
            
            <h3>9.2 Módosítások</h3>
            <p>A Szolgáltató fenntartja a jogot az ÁSZF módosítására. A módosított ÁSZF hatályba lépéséről a Szolgáltató a weboldalon keresztül tájékoztatja ügyfeleit. A módosítások nem visszamenőleges hatállyal lépnek életbe.</p>
            
            <h3>9.3 Hatályba lépés</h3>
            <p>Ez az ÁSZF <strong>2026. március 1-jén</strong> lépett hatályba, és a korábbi, 2024. január 1-jén kelt ÁSZF-et hatályon kívül helyezi.</p>
          </div>

          <div className="altSzerFelt-section">
            <h2>10. Elérhetőségek</h2>
            <p>Ha kérdése van az Általános Szerződési Feltételekkel kapcsolatban, kérjük, forduljon hozzánk bizalommal:</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#4fc3f7', fontSize: '24px', marginBottom: '10px' }}></i>
                <h4 style={{ margin: '10px 0' }}>Székhely</h4>
                <p>8360 Keszthely, Pajta alja utca 10.</p>
              </div>
              
              <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <i className="fas fa-phone" style={{ color: '#4fc3f7', fontSize: '24px', marginBottom: '10px' }}></i>
                <h4 style={{ margin: '10px 0' }}>Telefon</h4>
                <p>+36 83 123 456</p>
              </div>
              
              <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <i className="fas fa-envelope" style={{ color: '#4fc3f7', fontSize: '24px', marginBottom: '10px' }}></i>
                <h4 style={{ margin: '10px 0' }}>E-mail</h4>
                <p>betonlgs@gmail.com</p>
              </div>
              
              <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <i className="fas fa-clock" style={{ color: '#4fc3f7', fontSize: '24px', marginBottom: '10px' }}></i>
                <h4 style={{ margin: '10px 0' }}>Ügyfélszolgálat</h4>
                <p>H-P: 7:00-16:00<br />Szo: 8:00-12:00</p>
              </div>
            </div>
          </div>

          <div className="altSzerFelt-highlight-box">
            <p><strong>Kapcsolat üzleti partnerek számára:</strong></p>
            <p>BetonLogisztika Kft.<br />
            8360 Keszthely, Pajta alja utca 10.<br />
            Telefon: +36 83 123 456<br />
            E-mail: betonlgs@gmail.com<br />
            Adószám: 12345678-2-20<br />
            Bankszámla: OTP Bank 11700000-22223333</p>
          </div>
        </div>
      </section>

      <footer className="altSzerFelt-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8360 Keszthely, Pajta alja utca 10. | <a href="tel:+3683123456">+36 83 123 456</a> | <a href="mailto:betonlgs@gmail.com">betonlgs@gmail.com</a></p>

        <div className="altSzerFelt-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="altSzerFelt-social-icons">
          <a href="https://www.facebook.com/betonlogisztika" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="altSzerFelt-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default AltSzerFelt;