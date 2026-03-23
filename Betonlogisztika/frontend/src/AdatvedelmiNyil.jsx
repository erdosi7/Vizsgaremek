import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdatvedelmiNyil.css';

const AdatvedelmiNyil = ({ onLogout }) => {
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
      const headerElement = document.querySelector('.adatvedelem-header');
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
      <header className="adatvedelem-header">
        <div className="adatvedelem-header-container">
          <a href="/" className="adatvedelem-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="adatvedelem-logo-icon"></div>
            <div className="adatvedelem-logo-text">BetonLogisztika</div>
          </a>
          <ul className="adatvedelem-nav-menu">
            <li className="adatvedelem-nav-item">
              <a href="/" className="adatvedelem-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="adatvedelem-nav-item">
              <a href="/megrendeles" className="adatvedelem-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="adatvedelem-nav-item">
              <a href="/ajanlatkeres" className="adatvedelem-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="adatvedelem-nav-item">
              <a href="/kapcsolat" className="adatvedelem-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="adatvedelem-nav-item">
              <a href="/partnereink" className="adatvedelem-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
            <li className="adatvedelem-nav-item">
              <a href="/adatvedelmi_nyil" className="adatvedelem-nav-link active" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelem</a>
            </li>
          </ul>

          <div className="adatvedelem-account-menu">
            <div className="adatvedelem-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`adatvedelem-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="adatvedelem-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="adatvedelem-account-content">

                <a href="/megrendeleim" className="adatvedelem-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>

                <a href="/ajanlataim" className="adatvedelem-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>

                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="adatvedelem-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}

                <button className="adatvedelem-account-menu-item adatvedelem-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="adatvedelem-hero">
        <div className="adatvedelem-hero-content">
          <h1>Adatvédelmi Nyilatkozat</h1>
          <p>A BetonLogisztika Kft. adatvédelmi elvei és gyakorlata</p>
        </div>
      </section>

      <section className="adatvedelem-container">
        <div className="adatvedelem-content">
          <div className="adatvedelem-highlight-box">
            <p><strong>Fontos információk:</strong> Ez az adatvédelmi nyilatkozat tájékoztatást ad az Ön személyes adatainak kezeléséről, amikor weboldalunkat látogatja, vagy szolgáltatásainkat igénybe veszi.</p>
            <p>Utolsó frissítés: 2026. március 1.</p>
          </div>

          <div className="adatvedelem-section">
            <h2>1. Az adatkezelő adatai</h2>
            <p><strong>BetonLogisztika Kft.</strong> (a továbbiakban: "Adatkezelő" vagy "Cég")</p>
            <p><strong>Székhely:</strong> 8360 Keszthely, Pajta alja utca 10.</p>
            <p><strong>Adószám:</strong> 12345678-2-20</p>
            <p><strong>Cégjegyzékszám:</strong> 20-09-123456</p>
            <p><strong>Telefon:</strong> +36 83 123 456</p>
            <p><strong>E-mail:</strong> betonlgs@gmail.com</p>
            <p><strong>Adatvédelmi tisztviselő:</strong> Dr. Varga Márta (elérhetőség: adatvedelem@betonlgs.hu)</p>
          </div>

          <div className="adatvedelem-section">
            <h2>2. Kezelt személyes adatok és kezelésük alapja</h2>
            <h3>2.1 Milyen adatokat gyűjtünk?</h3>
            <p>Az alábbi típusú személyes adatokat kezelhetjük:</p>
            <ul className="adatvedelem-list">
              <li><strong>Kapcsolattartási adatok:</strong> név, telefonszám, e-mail cím, postacím</li>
              <li><strong>Üzleti adatok:</strong> cég neve, adószám, számlázási cím</li>
              <li><strong>Projektadatok:</strong> építkezés címe, beton típusa, mennyisége, szállítás időpontja</li>
              <li><strong>Kommunikációs adatok:</strong> levelezések, megkeresések tartalma</li>
              <li><strong>Weboldal látogatási adatok:</strong> IP-cím, böngésző típusa, látogatás ideje, oldalak, amelyeket meglátogatott</li>
            </ul>
            
            <h3>2.2 Adatkezelés jogalapja</h3>
            <p>Adatkezelésünk a következő jogalapokon történik:</p>
            <ul className="adatvedelem-list">
              <li><strong>Szerződés teljesítése:</strong> A megrendelés teljesítéséhez szükséges adatok kezelése</li>
              <li><strong>Jogos érdek:</strong> Ügyfélkapcsolatok kialakítása és fenntartása, marketing tevékenységek</li>
              <li><strong>Jogi kötelezettség:</strong> Könyvelési és adózási kötelezettségek teljesítése</li>
              <li><strong>Hozzájárulás:</strong> Hírlevél feliratkozáshoz, speciális ajánlatokhoz</li>
            </ul>
          </div>

          <div className="adatvedelem-section">
            <h2>3. Adatkezelés céljai</h2>
            <div className="adatvedelem-info-table">
              <table>
                <thead>
                  <tr>
                    <th>Adatkezelés célja</th>
                    <th>Kezelt adatok típusa</th>
                    <th>Jogalap</th>
                    <th>Megőrzési idő</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Megrendelés teljesítése</td>
                    <td>Kapcsolattartási, üzleti, projektadatok</td>
                    <td>Szerződés teljesítése</td>
                    <td>8 év (számlák)</td>
                  </tr>
                  <tr>
                    <td>Ajánlatkészítés</td>
                    <td>Kapcsolattartási, projektadatok</td>
                    <td>Jogos érdek</td>
                    <td>2 év</td>
                  </tr>
                  <tr>
                    <td>Ügyfélszolgálat</td>
                    <td>Kapcsolattartási, kommunikációs adatok</td>
                    <td>Jogos érdek</td>
                    <td>5 év</td>
                  </tr>
                  <tr>
                    <td>Marketing, hírlevelek</td>
                    <td>E-mail cím</td>
                    <td>Hozzájárulás</td>
                    <td>Amíg vissza nem vonja hozzájárulását</td>
                  </tr>
                  <tr>
                    <td>Weboldal működtetése</td>
                    <td>Technikai adatok (IP-cím, cookie-k)</td>
                    <td>Jogos érdek</td>
                    <td>Max. 2 év</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="adatvedelem-section">
            <h2>4. Adatmegőrzés</h2>
            <p>A személyes adatokat csak a cél eléréséhez szükséges ideig őrizzük meg:</p>
            <ul className="adatvedelem-list">
              <li><strong>Szerződéses kapcsolatok:</strong> A szerződés teljesítésétől számított 5 év</li>
              <li><strong>Számlák:</strong> 8 év a számviteli törvény szerint</li>
              <li><strong>Marketing célú adatok:</strong> Amíg az érintett vissza nem vonja hozzájárulását</li>
              <li><strong>Weboldal látogatási adatok:</strong> Maximum 2 év</li>
            </ul>
            <p>Az adatok megőrzési idejének lejárta után biztonságosan megsemmisítjük őket.</p>
          </div>

          <div className="adatvedelem-section">
            <h2>5. Adatfeldolgozók és adattovábbítás</h2>
            <h3>5.1 Adatfeldolgozók</h3>
            <p>Az alábbi adatfeldolgozókkal dolgozunk együtt, akik az adatokat csak utasításaink alapján kezelik:</p>
            <ul className="adatvedelem-list">
              <li><strong>Számlázási rendszer:</strong> NAV Online Számla rendszer</li>
              <li><strong>IT szolgáltatók:</strong> Weboldal üzemeltetés, biztonsági mentések</li>
              <li><strong>Marketing partnerek:</strong> Hírlevélküldés szolgáltatók (csak hozzájárulás esetén)</li>
            </ul>
            
            <h3>5.2 Nemzetközi adattovábbítás</h3>
            <p>Általában nem továbbítunk személyes adatokat az Európai Gazdasági Térségen kívül. Ha mégis szükséges lenne, kizárólag az EU által megfelelőnek nyilvánított országokba történne a továbbítás.</p>
          </div>

          <div className="adatvedelem-section">
            <h2>6. Az érintett jogai</h2>
            <p>Ön jogosult a következőkre:</p>
            
            <div className="adatvedelem-data-processing-box">
              <h4><i className="fas fa-eye"></i> Hozzáférési jog</h4>
              <p>Kérheti személyes adatainak másolatát, amelyeket kezelünk.</p>
            </div>
            
            <div className="adatvedelem-data-processing-box">
              <h4><i className="fas fa-edit"></i> Javítási jog</h4>
              <p>Kérheti pontatlan személyes adatainak helyesbítését.</p>
            </div>
            
            <div className="adatvedelem-data-processing-box">
              <h4><i className="fas fa-trash-alt"></i> Törlési jog ("a feledtetéshez való jog")</h4>
              <p>Kérheti személyes adatainak törlését bizonyos feltételek fennállása esetén.</p>
            </div>
            
            <div className="adatvedelem-data-processing-box">
              <h4><i className="fas fa-ban"></i> Korlátozási jog</h4>
              <p>Kérheti adatainak kezelésének korlátozását bizonyos feltételek mellett.</p>
            </div>
            
            <div className="adatvedelem-data-processing-box">
              <h4><i className="fas fa-download"></i> Adathordozhatósági jog</h4>
              <p>Kérheti adatainak szerkeztált, széles körben használt, géppel olvasható formátumban történő átadását.</p>
            </div>
            
            <div className="adatvedelem-data-processing-box">
              <h4><i className="fas fa-times-circle"></i> Tiltakozási jog</h4>
              <p>Bármikor tiltakozhat személyes adatainak kezelése ellen, ha az kezelésünk jogos érdeken alapul.</p>
            </div>
            
            <div className="adatvedelem-data-processing-box">
              <h4><i className="fas fa-user-times"></i> Hozzájárulás visszavonása</h4>
              <p>Bármikor visszavonhatja hozzájárulását a marketing célú adatkezeléshez.</p>
            </div>
            
            <p>Jogainak érvényesítéséhez írjon e-mailt a <strong>betonlgs@gmail.com</strong> címre, vagy küldjön levelet a 8360 Keszthely, Pajta alja utca 10. címre.</p>
          </div>

          <div className="adatvedelem-section">
            <h2>7. Sütik (cookie-k)</h2>
            <h3>7.1 Milyen sütiket használunk?</h3>
            <p>Weboldalunk a következő típusú sütiket használja:</p>
            <ul className="adatvedelem-list">
              <li><strong>Funkcionális sütik:</strong> A weboldal megfelelő működéséhez szükségesek</li>
              <li><strong>Analitikai sütik:</strong> A látogatók viselkedésének elemzéséhez (Google Analytics)</li>
              <li><strong>Marketing sütik:</strong> Relevánsabb hirdetések megjelenítéséhez</li>
            </ul>
            
            <h3>7.2 Hogyan kezelheti a sütiket?</h3>
            <p>Böngészője beállításaiban korlátozhatja vagy tiltályhatja a sütik használatát. Azonban tudnia kell, hogy egyes sütik nélkül weboldalunk nem fog megfelelően működni.</p>
            <p>Első látogatásakor megkérjük, hogy fogadja el a sütik használatát. A beállítások bármikor módosíthatók.</p>
          </div>

          <div className="adatvedelem-section">
            <h2>8. Adatbiztonság</h2>
            <p>Komolyan vesszük adatai védelmét, és megfelelő technikai és szervezési intézkedéseket alkalmazunk annak érdekében, hogy adatai biztonságban legyenek.</p>
            <p>Intézkedéseink közé tartoznak:</p>
            <ul className="adatvedelem-list">
              <li>Adatátviteli titkosítás (SSL tanúsítvány)</li>
              <li>Rendszeres biztonsági mentések</li>
              <li>Hozzáférési jogosultságok szigorú ellenőrzése</li>
              <li>Képzett munkatársak, akik ismerik adatvédelmi kötelezettségeinket</li>
              <li>Fizikai védelem a papír alapú adatokhoz</li>
            </ul>
          </div>

          <div className="adatvedelem-section">
            <h2>9. Panasz benyújtása</h2>
            <p>Ha úgy véli, hogy adatvédelmi jogaikat megsértettük, kérem, először forduljon hozzánk a <strong>betonlgs@gmail.com</strong> címen, hogy együtt megoldhassuk a problémát.</p>
            <p>Ha nem elégedett válaszunkkal, panaszt nyújthat be a Nemzeti Adatvédelmi és Információszabadság Hatósághoz:</p>
            <p><strong>Nemzeti Adatvédelmi és Információszabadság Hatóság</strong><br />
            Székhely: 1055 Budapest, Falk Miksa utca 9-11.<br />
            Levelezési cím: 1363 Budapest, Pf.: 9.<br />
            Telefon: +36 1 391 1400<br />
            Fax: +36 1 391 1410<br />
            E-mail: ugyfelszolgalat@naih.hu<br />
            Web: <a href="https://www.naih.hu" target="_blank" rel="noopener noreferrer">www.naih.hu</a></p>
          </div>

          <div className="adatvedelem-section">
            <h2>10. Módosítások a nyilatkozatban</h2>
            <p>Ez az adatvédelmi nyilatkozat időnként frissül. A legutóbbi változat mindig elérhető lesz ezen az oldalon. Jelentős változások esetén értesítjük Önt e-mailben vagy a weboldalon keresztül.</p>
            <p>Utolsó módosítás dátuma: 2026. március 1.</p>
          </div>

          <div className="adatvedelem-highlight-box">
            <p><strong>Kapcsolat az adatvédelmi kérdésekben:</strong></p>
            <p>BetonLogisztika Kft.<br />
            8360 Keszthely, Pajta alja utca 10.<br />
            Telefon: +36 83 123 456<br />
            E-mail: <strong>betonlgs@gmail.com</strong></p>
            <p>Ügyfélszolgálat: Hétfőtől péntekig 7:00-16:00 között</p>
          </div>
        </div>
      </section>

      <footer className="adatvedelem-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8360 Keszthely, Pajta alja utca 10. | <a href="tel:+363083123456">+36 83 123 456</a> | <a href="mailto:betonlgs@gmail.com">betonlgs@gmail.com</a></p>

        <div className="adatvedelem-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="adatvedelem-social-icons">
          <a href="https://www.facebook.com/betonlogisztika" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="adatvedelem-footer-copyright">
          <p>&copy; 2026 BetonLogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default AdatvedelmiNyil;