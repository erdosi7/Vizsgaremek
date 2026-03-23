import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Impresszum.css';

const Impresszum = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);

  // Felhasználó adatok betöltése tokenből
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
      const headerElement = document.querySelector('.impresszum-header');
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
      <header className="impresszum-header">
        <div className="impresszum-header-container">
          <a href="/" className="impresszum-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="impresszum-logo-icon"></div>
            <div className="impresszum-logo-text">BetonLogisztika</div>
          </a>
          <ul className="impresszum-nav-menu">
            <li className="impresszum-nav-item">
              <a href="/" className="impresszum-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="impresszum-nav-item">
              <a href="/megrendeles" className="impresszum-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="impresszum-nav-item">
              <a href="/ajanlatkeres" className="impresszum-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="impresszum-nav-item">
              <a href="/kapcsolat" className="impresszum-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="impresszum-nav-item">
              <a href="/partnereink" className="impresszum-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
            <li className="impresszum-nav-item">
              <a href="/impresszum" className="impresszum-nav-link active" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
            </li>
          </ul>
          
          {/* Fiók menü */}
          <div className="impresszum-account-menu">
            <div className="impresszum-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`impresszum-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="impresszum-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="impresszum-account-content">
                
                {/* Megrendeléseim */}
                <a href="/megrendeleim" className="impresszum-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>
                
                {/* Ajánlataim */}
                <a href="/ajanlataim" className="impresszum-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>
                
                {/* Admin Dashboard - CSAK ADMINOKNAK */}
                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="impresszum-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}
                
                {/* Kijelentkezés gomb */}
                <button className="impresszum-account-menu-item impresszum-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero szekció */}
      <section className="impresszum-hero">
        <div className="impresszum-hero-content">
          <h1>Impresszum</h1>
          <p>Hivatalos cég- és kapcsolati információk a BetonLogisztika Kft.-ről</p>
        </div>
      </section>

      <section className="impresszum-container">
        <div className="impresszum-content">
          <div className="impresszum-highlight-box">
            <p><strong>Fontos információk:</strong> Ez az impresszum oldal tartalmazza a BetonLogisztika Kft. hivatalos cégadatait, kapcsolati információit és jogi nyilatkozatokat.</p>
            <p>Utolsó frissítés: 2026. március 1.</p>
          </div>

          <div className="impresszum-section">
            <h2>Cégadatok</h2>
            
            <div className="impresszum-company-info">
              <h4><i className="fas fa-building"></i> BetonLogisztika Kft.</h4>
              <p>2005 óta a betonszállítás és -keverés területén működő, megbízható szakmai partner.</p>
            </div>
            
            <div className="impresszum-contact-grid">
              <div className="impresszum-contact-card">
                <i className="fas fa-map-marker-alt"></i>
                <h4>Székhely</h4>
                <p>8360 Keszthely, Pajta alja utca 10.</p>
              </div>
              
              <div className="impresszum-contact-card">
                <i className="fas fa-phone"></i>
                <h4>Telefon</h4>
                <p>+36 83 123 456</p>
              </div>
              
              <div className="impresszum-contact-card">
                <i className="fas fa-envelope"></i>
                <h4>E-mail</h4>
                <p>betonlgs@gmail.com</p>
              </div>
            </div>
            
            <h3><i className="fas fa-id-card"></i> Jogi információk</h3>
            <table className="impresszum-legal-table">
              <thead>
                <tr>
                  <th>Adat típusa</th>
                  <th>Érték</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cég neve</td>
                  <td>BetonLogisztika Korlátolt Felelősségű Társaság</td>
                </tr>
                <tr>
                  <td>Cégjegyzékszám</td>
                  <td>20-09-123456</td>
                </tr>
                <tr>
                  <td>Adószám</td>
                  <td>12345678-2-20</td>
                </tr>
                <tr>
                  <td>Statisztikai számjel</td>
                  <td>12345678-4391-113-20</td>
                </tr>
                <tr>
                  <td>EU áfa szám</td>
                  <td>HU12345678</td>
                </tr>
                <tr>
                  <td>Alapítás dátuma</td>
                  <td>2005. május 15.</td>
                </tr>
                <tr>
                  <td>Tevékenységi kör</td>
                  <td>43.91 Betonmalom üzemeltetése; Betonszállítás</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="impresszum-section">
            <h2>Vezetés és felelősök</h2>
            
            <h3><i className="fas fa-user-tie"></i> Ügyvezető igazgató</h3>
            <p><strong>Kovács János</strong><br />
            Telefon: +36 30 997 3432<br />
            E-mail: kovacs.janos@betonlgs.hu</p>
            
            <h3><i className="fas fa-user-cog"></i> Műszaki vezető</h3>
            <p><strong>Nagy Péter</strong><br />
            Telefon: +36 30 555 6789<br />
            E-mail: nagy.peter@betonlgs.hu</p>
            
            <h3><i className="fas fa-chart-line"></i> Ügyfélszolgálat vezető</h3>
            <p><strong>Szabó Eszter</strong><br />
            Telefon: +36 30 777 8899<br />
            E-mail: szabo.eszter@betonlgs.hu</p>
            
            <h3><i className="fas fa-balance-scale"></i> Jogi képviselő</h3>
            <p><strong>Dr. Tóth Gábor</strong><br />
            Ügyvédi Iroda: JogiPartner Kft.<br />
            Telefon: +36 1 234 5678<br />
            E-mail: info@jogipartner.hu</p>
          </div>

          <div className="impresszum-section">
            <h2>Bankszámla információk</h2>
            
            <h3><i className="fas fa-university"></i> Fő bankszámla</h3>
            <p><strong>OTP Bank Nyrt.</strong><br />
            Számlaszám: 11700000-22223333<br />
            IBAN: HU12 1170 0000 2222 3333 4444 5555<br />
            SWIFT/BIC: OTPVHUHB</p>
            
            <h3><i className="fas fa-credit-card"></i> Fizetési feltételek</h3>
            <ul className="impresszum-list">
              <li>Készpénzes fizetés szállításkor</li>
              <li>Átutalás (14 napos fizetési határidő)</li>
              <li>Bankkártyás fizetés (VISA, MasterCard, American Express)</li>
              <li>Vállalati hitel (előzetes egyeztetés alapján)</li>
              <li>Részletfizetési lehetőség (minimum 500.000 Ft felett)</li>
            </ul>
          </div>

          <div className="impresszum-section">
            <h2>Nyitvatartás</h2>
            
            <h3><i className="fas fa-clock"></i> Irodai nyitvatartás</h3>
            <table className="impresszum-legal-table">
              <thead>
                <tr>
                  <th>Nap</th>
                  <th>Idő</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hétfő - Péntek</td>
                  <td>7:00 - 16:00</td>
                </tr>
                <tr>
                  <td>Szombat</td>
                  <td>8:00 - 12:00</td>
                </tr>
                <tr>
                  <td>Vasárnap</td>
                  <td>Zárva</td>
                </tr>
              </tbody>
            </table>
            
            <h3><i className="fas fa-calendar-alt"></i> Ünnepnapok 2026</h3>
            <p>Az alábbi ünnepnapokon az iroda és a szállítás is szünetel:</p>
            <ul className="impresszum-list">
              <li>Január 1. - Újév</li>
              <li>Március 15. - Az 1848-as forradalom ünnepe</li>
              <li>Április 3-6. - Húsvét</li>
              <li>Május 1. - A munka ünnepe</li>
              <li>Május 24. - Pünkösd</li>
              <li>Augusztus 20. - Az államalapítás ünnepe</li>
              <li>Október 23. - Az 1956-os forradalom ünnepe</li>
              <li>November 1. - Mindenszentek</li>
              <li>December 24-26. - Karácsony</li>
              <li>December 31. - Szilveszter</li>
            </ul>
          </div>

          <div className="impresszum-section">
            <h2>Szolgáltatási terület</h2>
            
            <h3><i className="fas fa-map-marked-alt"></i> Fő szolgáltatási területek</h3>
            <p>A BetonLogisztika Kft. főként a következő régiókban végzi tevékenységét:</p>
            <ul className="impresszum-list">
              <li>Zala megye (teljes terület)</li>
              <li>Vas megye (déli része)</li>
              <li>Somogy megye (nyugati része)</li>
              <li>Veszprém megye (déli része)</li>
              <li>Győr-Moson-Sopron megye (kijelölt területek)</li>
            </ul>
            
            <p>Országos lefedettségű projektek esetén egyedi megbeszélés alapján országosan is szállítunk.</p>
            
            <h3><i className="fas fa-truck"></i> Szállítási zónák</h3>
            <p>A szállítási költség a távolságtól függően változik:</p>
            <ul className="impresszum-list">
              <li><strong>A zóna:</strong> 0-25 km (alap díj: 15.000 Ft + ÁFA)</li>
              <li><strong>B zóna:</strong> 26-50 km (+15%, kb. 17.250 Ft + ÁFA)</li>
              <li><strong>C zóna:</strong> 51-100 km (+30%, kb. 19.500 Ft + ÁFA)</li>
              <li><strong>D zóna:</strong> 100+ km (egyedi árazás, km-enként 350 Ft + ÁFA)</li>
            </ul>
          </div>

          <div className="impresszum-section">
            <h2>Szervezetek és tagságok</h2>
            
            <h3><i className="fas fa-handshake"></i> Tagságok</h3>
            <ul className="impresszum-list">
              <li>Magyar Építőipari Szövetség (MÉSZ) - tagsági szám: MÉSZ-2023-0456</li>
              <li>Zala Megyei Iparkamara - tagsági szám: ZMIK-2005-1122</li>
              <li>Magyar Betonipari Szövetség - tagsági szám: MBSZ-2008-0789</li>
              <li>Magyar Logisztikai Egyesület - tagsági szám: MLE-2012-0345</li>
              <li>Vállalkozók Országos Szövetsége - tagsági szám: VOSZ-2015-0678</li>
            </ul>
            
            <h3><i className="fas fa-award"></i> Minősítések és tanúsítványok</h3>
            <ul className="impresszum-list">
              <li>ISO 9001:2015 Minőségirányítási rendszer - tanúsítvány szám: MSZT-12345/2023</li>
              <li>ISO 14001:2015 Környezetvédelmi irányítási rendszer - tanúsítvány szám: MSZT-67890/2023</li>
              <li>ISO 45001:2018 Munkahelyi egészségvédelem és biztonság - tanúsítvány szám: MSZT-11223/2024</li>
              <li>Betonminősítő Tanúsítvány (BM T.12345) - érvényes: 2026. december 31-ig</li>
              <li>Kiváló Minőségű Beton Díj - 2022, 2023, 2024</li>
              <li>Családbarát Vállalkozás minősítés - 2025</li>
            </ul>
          </div>

          <div className="impresszum-section">
            <h2>Adatkezelés és jogi nyilatkozatok</h2>
            
            <h3><i className="fas fa-database"></i> Adatvédelmi tisztviselő</h3>
            <p><strong>Dr. Varga Márta</strong><br />
            E-mail: adatvedelem@betonlgs.hu<br />
            Telefon: +36 30 444 5566</p>
            
            <h3><i className="fas fa-file-signature"></i> Panaszkezelés</h3>
            <p>Panasz esetén kérjük, vegye fel a kapcsolatot ügyfélszolgálatunkkal:<br />
            E-mail: panasz@betonlgs.hu<br />
            Telefon: +36 30 777 8899<br />
            Postai cím: 8360 Keszthely, Pajta alja utca 10.</p>
            
            <h3><i className="fas fa-balance-scale"></i> Békéltető testület</h3>
            <p>Zala Megyei Békéltető Testület<br />
            Cím: 8900 Zalaegerszeg, Petőfi u. 24.<br />
            Telefon: +36 92 123 456<br />
            E-mail: bekelteto@zmkik.hu</p>
            
            <div className="impresszum-highlight-box">
              <p><strong>Kapcsolat üzleti partnerek számára:</strong></p>
              <p>BetonLogisztika Kft.<br />
              8360 Keszthely, Pajta alja utca 10.<br />
              Telefon: +36 83 123 456<br />
              E-mail: betonlgs@gmail.com<br />
              Ügyfélkapu azonosító: 12345678<br />
              Hivatalos levelezési cím: 8360 Keszthely, Pajta alja utca 10.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="impresszum-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8360 Keszthely, Pajta alja utca 10. | <a href="tel:+3683123456">+36 83 123 456</a> | <a href="mailto:betonlgs@gmail.com">betonlgs@gmail.com</a></p>

        <div className="impresszum-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="impresszum-social-icons">
          <a href="https://www.facebook.com/betonlogisztika" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="impresszum-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Impresszum;