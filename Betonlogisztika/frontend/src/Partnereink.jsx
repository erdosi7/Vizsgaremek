import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Partnereink.css';

const Partnereink = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

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
  const loadPartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/partnerek', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {

        const formattedPartners = data.partnerek.map(p => ({
          id: p.id,
          name: p.nev,
          fullName: p.nev + ' - ' + p.telephely_nev,
          coords: [parseFloat(p.latitud), parseFloat(p.longitud)],
          address: p.telephely_nev,
          shortName: p.nev.split(' ')[0] || p.nev.substring(0, 8),
          website: p.website || '#',
          phone: p.telefon || '+36 30 123 4567'
        }));
        setPartners(formattedPartners);
      }
    } catch (error) {
      console.error('Hiba a partnerek betöltésekor:', error);
    } finally {
      setLoading(false);
    }
  };

  loadPartners();
}, []);

  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.querySelector('.partnereink-header');
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

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current && typeof L !== 'undefined' && partners.length > 0 && !loading) {

      const map = L.map(mapRef.current).setView([46.9541, 17.5861], 9);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapInstanceRef.current = map;
  
      partners.forEach(partner => {

        const customIcon = L.divIcon({
          className: 'partnereink-custom-marker',
          html: `<div class="partnereink-marker-content">
                  <span class="partnereink-marker-name">${partner.shortName}</span>
                  <div class="partnereink-marker-dot"></div>
                </div>`,
          iconSize: [100, 50],
          iconAnchor: [50, 25],
          popupAnchor: [0, -20]
        });
        
        const marker = L.marker(partner.coords, { icon: customIcon }).addTo(map);
        
        marker.on('click', () => {
          setSelectedPartner(partner);
          setActiveMarker(partner.id);
        });
        
        marker.partnerId = partner.id;
        markersRef.current.push(marker);
      });
    }
  }, [partners, loading]);

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

  const filterMarkers = (region) => {
  
  };

  const handleRegionFilter = (e, region) => {
    e.preventDefault();
 
    document.querySelectorAll('.partnereink-map-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    filterMarkers(region);
  };

  return (
    <>
      <header className="partnereink-header">
        <div className="partnereink-header-container">
       
          <a href="/" className="partnereink-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="partnereink-logo-icon"></div>
            <div className="partnereink-logo-text">BetonLogisztika</div>
          </a>
       
          <ul className="partnereink-nav-menu">
            <li className="partnereink-nav-item">
              <a href="/" className="partnereink-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="partnereink-nav-item">
              <a href="/megrendeles" className="partnereink-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="partnereink-nav-item">
              <a href="/ajanlatkeres" className="partnereink-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="partnereink-nav-item">
              <a href="/kapcsolat" className="partnereink-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="partnereink-nav-item">
              <a href="/partnereink" className="partnereink-nav-link active" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
          </ul>
        
          <div className="partnereink-account-menu">
            <div className="partnereink-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`partnereink-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="partnereink-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="partnereink-account-content">
           
                <a href="/megrendeleim" className="partnereink-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>
              
                <a href="/ajanlataim" className="partnereink-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>
             
                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="partnereink-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}
           
                <button className="partnereink-account-menu-item partnereink-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
          
        </div> 
      </header>

      <section className="partnereink-hero">
        <div className="partnereink-hero-content">
          <h1>Partnereink</h1>
          <p>Minőségi együttműködések, amelyek erősítik szolgáltatásaink színvonalát.</p>
        </div>
      </section>

      <section className="partnereink-join-top">
        <div className="partnereink-join-top-container">
          <div className="partnereink-join-top-content">
            <i className="fas fa-handshake partnereink-join-top-icon"></i>
            <h2>Csatlakozzon partnereinkhez!</h2>
            <p>Ha Ön is szeretne a partnereink között szerepelni, lépjen velünk kapcsolatba.</p>
            <a href="/kapcsolat" className="partnereink-join-top-btn" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>
              Kapcsolatfelvétel <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      <section className="partnereink-map-section">
        <div className="partnereink-map-container">
          <h2 className="partnereink-section-title">Partnereink elhelyezkedése</h2>
          <p className="partnereink-section-subtitle">Fedezze fel partnereink telephelyeit az alábbi interaktív térképen - kattintson a markerekre a részletekért!</p>
          
          <div className="partnereink-map-controls">
            <button className="partnereink-map-btn active" onClick={(e) => handleRegionFilter(e, 'all')}>Összes partner</button>
          </div>
          
          {loading ? (
            <div className="partnereink-loading">Térkép betöltése...</div>
          ) : (
            <div className="partnereink-map" ref={mapRef} id="partners-map"></div>
          )}
        </div>
      </section>

      {selectedPartner && (
        <section className="partnereink-selected-partner" id={`partner-details-${selectedPartner.id}`}>
          <div className="partnereink-selected-container">
            <div className="partnereink-selected-card">
              <div className="partnereink-selected-header">
                <i className="fas fa-handshake" style={{ fontSize: '40px', color: '#4fc3f7', marginRight: '15px' }}></i>
                <h4>{selectedPartner.fullName || selectedPartner.name}</h4>
              </div>
              <div className="partnereink-selected-details">
                <div className="partnereink-selected-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{selectedPartner.address}</span>
                </div>
                <div className="partnereink-selected-item">
                  <i className="fas fa-phone"></i>
                  <span>{selectedPartner.phone}</span>
                </div>
                <div className="partnereink-selected-item">
  <i className="fas fa-globe"></i>
  {selectedPartner.website && selectedPartner.website !== 'Nem található weboldal.' ? (
    <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="partnereink-selected-link">
      {selectedPartner.website.replace('https://', '').replace('http://', '')}
    </a>
  ) : (
    <span className="partnereink-no-website">Nincs weboldal</span>
  )}
</div>
              </div>
              <button className="partnereink-selected-close" onClick={() => {
                setSelectedPartner(null);
                setActiveMarker(null);
              }}>
                <i className="fas fa-times"></i> Bezárás
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="partnereink-benefits-bottom">
        <div className="partnereink-benefits-bottom-container">
          <h2 className="partnereink-section-title">Az együttműködés előnyei</h2>
          <p className="partnereink-section-subtitle">Partnereinkkel való szoros kapcsolatunk számos előnnyel jár ügyfeleink számára.</p>
          <div className="partnereink-benefits-bottom-grid">
            <div className="partnereink-benefit-bottom-card">
              <div className="partnereink-benefit-bottom-icon">
                <i className="fas fa-gem"></i>
              </div>
              <h3>Minőségi anyagok</h3>
              <p>Kizárólag a legjobb minőségű alapanyagokat használjuk partnereinktől.</p>
            </div>
            <div className="partnereink-benefit-bottom-card">
              <div className="partnereink-benefit-bottom-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h3>Gyors szállítás</h3>
              <p>Hatékony logisztikai hálózatunknak köszönhetően gyorsan érkezünk.</p>
            </div>
            <div className="partnereink-benefit-bottom-card">
              <div className="partnereink-benefit-bottom-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3>Megbízhatóság</h3>
              <p>Partnereink megbízhatósága garantálja szolgáltatásaink stabilitását.</p>
            </div>
            <div className="partnereink-benefit-bottom-card">
              <div className="partnereink-benefit-bottom-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h3>Technológiai előnyök</h3>
              <p>Hozzáférünk a legmodernebb technológiákhoz és megoldásokhoz.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="partnereink-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8315 Meleghegyi utca 5., Gyenesdiás | <a href="tel:+36309973432">+36 30 997 3432</a> | <a href="mailto:info@betonlogisztika.hu">info@betonlogisztika.hu</a></p>

        <div className="partnereink-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="partnereink-social-icons">
          <a href="https://www.facebook.com/betonlogisztika/"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="partnereink-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Partnereink;