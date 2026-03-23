import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Ajanlataim.css';

const Ajanlataim = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);
 
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [isAdmin, setIsAdmin] = useState(false);
 
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);

  useEffect(() => {
    loadUserData();
    loadOffersFromBackend();
  }, []);

  const loadUserData = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/bejelentkezes');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      setUser(payload);
      
      if (payload.jogosultsag === 'admin') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.log('Token dekódolási hiba:', e);
    }
  };
  const loadOffersFromBackend = async () => {
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Nincs bejelentkezve!');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/ajanlataim', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const today = new Date();
        const processedOffers = data.ajanlatok.map(offer => {
          const validUntil = new Date(offer.ervenyes_ig);
          const isExpired = validUntil < today;
          
          return {
            ...offer,
            id: offer.id,
            number: offer.ajanlatszam,
            company: offer.betongyarto_nev || 'Ismeretlen cég',
            companyId: offer.betongyarto_id,
            typeText: offer.beton_tipus_nev || 'Ismeretlen típus',
            betonszalText: offer.betonszal_nev || 'Nem szükséges',
            quantity: offer.mennyiseg,
            location: `${offer.iranyitoszam} ${offer.telepules}, ${offer.utca} ${offer.hazszam}`,
            date: new Date(offer.letrehozas_datum).toLocaleDateString('hu-HU'),
            validUntil: new Date(offer.ervenyes_ig).toLocaleDateString('hu-HU'),
            nettoPriceFormatted: new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(offer.netto_osszeg),
            bruttoPriceFormatted: new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(offer.brutto_osszeg),
            status: offer.statusz || (isExpired ? 'lejárt' : 'függőben'),
            statusClass: offer.statusz === 'elfogadva' ? 'accepted' : 
                        offer.statusz === 'elutasítva' ? 'rejected' :
                        isExpired ? 'expired' : 
                        offer.statusz === 'függőben' ? 'pending' : 'valid',
            pumpa: offer.pumpa_szukseges ? 'Igen' : 'Nem',
            details: {
              betonAr: offer.beton_koltseg / offer.mennyiseg,
              betonKoltseg: offer.beton_koltseg,
              pumpaKoltseg: offer.pumpa_koltseg,
              betonszalKoltseg: offer.betonszal_koltseg,
              szallitasKoltseg: offer.szallitas_koltseg,
              afaOsszeg: offer.afa_osszeg
            }
          };
        });

        setOffers(processedOffers);
      } else {
        setError(data.message || 'Hiba történt az ajánlatok betöltése során!');
      }
    } catch (error) {
      console.error('❌ Hiba az ajánlatok betöltésekor:', error);
      setError('Hálózati hiba. Kérjük, próbálja újra később!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.querySelector('.ajanlataim-header');
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

  const getFilteredOffers = () => {
    if (filterStatus === 'all') return offers;
    return offers.filter(offer => offer.statusClass === filterStatus);
  };

  const handleStatusChange = async (offerId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/ajanlatok/${offerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statusz: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setOffers(offers.map(offer => {
          if (offer.id === offerId) {
            let statusText = '';
            switch(newStatus) {
              case 'függőben': statusText = 'függőben'; break;
              case 'elfogadva': statusText = 'elfogadva'; break;
              case 'elutasítva': statusText = 'elutasítva'; break;
              case 'lejárt': statusText = 'lejárt'; break;
              default: statusText = offer.status;
            }
            
            let statusClass = newStatus;
            if (newStatus === 'függőben') statusClass = 'pending';
            if (newStatus === 'elfogadva') statusClass = 'accepted';
            if (newStatus === 'elutasítva') statusClass = 'rejected';
            
            return { 
              ...offer, 
              statusClass: statusClass, 
              status: statusText 
            };
          }
          return offer;
        }));
      } else {
        alert(data.message || 'Hiba történt a státusz módosítása során!');
      }
    } catch (error) {
      console.error('❌ Hiba a státusz módosításakor:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleDeleteClick = (offer) => {
    if (offer.statusClass !== 'rejected' && offer.statusClass !== 'expired') {
      alert('Csak elutasított vagy lejárt státuszú ajánlat törölhető!');
      return;
    }
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = isAdmin 
        ? `http://localhost:3000/api/admin/ajanlatok/${offerToDelete.id}`
        : `http://localhost:3000/api/ajanlatok/${offerToDelete.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setOffers(offers.filter(offer => offer.id !== offerToDelete.id));
        setShowDeleteModal(false);
        setOfferToDelete(null);
        alert('✅ Ajánlat sikeresen törölve!');
      } else {
        alert(data.message || 'Hiba történt a törlés során!');
      }
    } catch (error) {
      console.error('❌ Hiba a törléskor:', error);
      alert('Hálózati hiba!');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOfferToDelete(null);
  };

  const getStatusBadgeClass = (statusClass) => {
    switch(statusClass) {
      case 'valid': return 'valid';
      case 'expired': return 'expired';
      case 'pending': return 'pending';
      case 'accepted': return 'accepted';
      case 'rejected': return 'rejected';
      default: return '';
    }
  };

  const getStatusIcon = (statusClass) => {
    switch(statusClass) {
      case 'valid':
      case 'accepted': return 'fa-check-circle';
      case 'expired': return 'fa-clock';
      case 'pending': return 'fa-hourglass-half';
      case 'rejected': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  };

  const getStatusText = (statusClass, status) => {
    if (status) return status;
    
    switch(statusClass) {
      case 'valid': return 'érvényes';
      case 'expired': return 'lejárt';
      case 'pending': return 'függőben';
      case 'accepted': return 'elfogadva';
      case 'rejected': return 'elutasítva';
      default: return 'ismeretlen';
    }
  };

  const handleNewOffer = () => {
    navigate('/ajanlatkeres');
  };

  const handleOrderFromOffer = (offer) => {
    navigate('/megrendeles', { 
      state: { 
        selectedOffer: {
          id: offer.id,
          number: offer.number,
          company: offer.company,
          companyId: offer.companyId,
          typeText: offer.typeText,
          quantity: offer.quantity,
          location: offer.location,
          nettoPriceFormatted: offer.nettoPriceFormatted,
          bruttoPriceFormatted: offer.bruttoPriceFormatted,
          details: offer.details
        }
      } 
    });
  };

  return (
    <>
      <header className="ajanlataim-header">
        <div className="ajanlataim-header-container">
          <a href="/" className="ajanlataim-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="ajanlataim-logo-icon"></div>
            <div className="ajanlataim-logo-text">BetonLogisztika</div>
          </a>
          <ul className="ajanlataim-nav-menu">
            <li className="ajanlataim-nav-item">
              <a href="/" className="ajanlataim-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="ajanlataim-nav-item">
              <a href="/megrendeles" className="ajanlataim-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="ajanlataim-nav-item">
              <a href="/ajanlatkeres" className="ajanlataim-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="ajanlataim-nav-item">
              <a href="/kapcsolat" className="ajanlataim-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="ajanlataim-nav-item">
              <a href="/partnereink" className="ajanlataim-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
          </ul>
  
          <div className="ajanlataim-account-menu">
            <div className="ajanlataim-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`ajanlataim-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="ajanlataim-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="ajanlataim-account-content">
 
                <a href="/megrendeleim" className="ajanlataim-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>

                <a href="/ajanlataim" className="ajanlataim-account-menu-item active" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>

                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="ajanlataim-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}

                <button className="ajanlataim-account-menu-item ajanlataim-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="ajanlataim-hero">
        <div className="ajanlataim-hero-content">
          <h1>Ajánlataim</h1>
          <p>Érvényes és lejárt ajánlataid áttekintése</p>
        </div>
      </section>

      <section className="ajanlataim-container">
        {isAdmin && (
          <div className="ajanlataim-admin-badge">
            <i className="fas fa-crown"></i> Admin mód
          </div>
        )}

        <div className="ajanlataim-filter">
          <button 
            className={`ajanlataim-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Összes ({offers.length})
          </button>
          <button 
            className={`ajanlataim-filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Függőben ({offers.filter(o => o.statusClass === 'pending').length})
          </button>
          <button 
            className={`ajanlataim-filter-btn ${filterStatus === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('accepted')}
          >
            Elfogadva ({offers.filter(o => o.statusClass === 'accepted').length})
          </button>
          <button 
            className={`ajanlataim-filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Elutasítva ({offers.filter(o => o.statusClass === 'rejected').length})
          </button>
          <button 
            className={`ajanlataim-filter-btn ${filterStatus === 'expired' ? 'active' : ''}`}
            onClick={() => setFilterStatus('expired')}
          >
            Lejárt ({offers.filter(o => o.statusClass === 'expired').length})
          </button>
        </div>

        <div className="ajanlataim-offers">
          {isLoading ? (
            <div className="ajanlataim-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Ajánlatok betöltése...</p>
            </div>
          ) : error ? (
            <div className="ajanlataim-error">
              <i className="fas fa-exclamation-circle"></i>
              <h3>Hiba történt</h3>
              <p>{error}</p>
              <button className="ajanlataim-retry-btn" onClick={loadOffersFromBackend}>
                <i className="fas fa-sync-alt"></i> Újra
              </button>
            </div>
          ) : offers.length > 0 ? (
            getFilteredOffers().length > 0 ? (
              getFilteredOffers().map(offer => (
                <div key={offer.id} className={`ajanlataim-offer-card ${offer.statusClass}`}>
                  <div className="ajanlataim-offer-header">
                    <div className="ajanlataim-offer-title">
                      <h3>{offer.number}</h3>
                      <span className={`ajanlataim-status-badge ${getStatusBadgeClass(offer.statusClass)}`}>
                        <i className={`fas ${getStatusIcon(offer.statusClass)}`}></i> {getStatusText(offer.statusClass, offer.status)}
                      </span>
                    </div>
                    <div className="ajanlataim-offer-actions">
               
                      {(offer.statusClass === 'rejected' || offer.statusClass === 'expired') && (
                        <button 
                          className="ajanlataim-offer-btn-delete"
                          onClick={() => handleDeleteClick(offer)}
                          title="Ajánlat törlése"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                  
                      {isAdmin && (
                        <select 
                          className="ajanlataim-status-select"
                          value={offer.statusClass === 'pending' ? 'függőben' : 
                                 offer.statusClass === 'accepted' ? 'elfogadva' :
                                 offer.statusClass === 'rejected' ? 'elutasítva' :
                                 offer.statusClass === 'expired' ? 'lejárt' : 'függőben'}
                          onChange={(e) => handleStatusChange(offer.id, e.target.value)}
                        >
                          <option value="függőben">Függőben</option>
                          <option value="elfogadva">Elfogadva</option>
                          <option value="elutasítva">Elutasítva</option>
                          <option value="lejárt">Lejárt</option>
                        </select>
                      )}
                      
                      {offer.statusClass === 'accepted' && (
                        <button 
                          className="ajanlataim-offer-btn ajanlataim-offer-btn-order"
                          onClick={() => handleOrderFromOffer(offer)}
                          title="Megrendelés ebből az ajánlatból"
                        >
                          <i className="fas fa-shopping-cart"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="ajanlataim-offer-details">
                    <div className="ajanlataim-offer-row">
                      <i className="fas fa-building"></i>
                      <span><strong>Betongyártó:</strong> {offer.company}</span>
                    </div>

                    <div className="ajanlataim-offer-row">
                      <i className="fas fa-cube"></i>
                      <span><strong>Beton típus:</strong> {offer.typeText}</span>
                    </div>
                    
                    {offer.betonszalText !== 'Nem szükséges' && (
                      <div className="ajanlataim-offer-row">
                        <i className="fas fa-th"></i>
                        <span><strong>Betonszál:</strong> {offer.betonszalText}</span>
                      </div>
                    )}
                    
                    <div className="ajanlataim-offer-row">
                      <i className="fas fa-weight"></i>
                      <span><strong>Mennyiség:</strong> {offer.quantity} m³</span>
                    </div>
                    <div className="ajanlataim-offer-row">
                      <i className="fas fa-map-marker-alt"></i>
                      <span><strong>Helyszín:</strong> {offer.location}</span>
                    </div>
                    <div className="ajanlataim-offer-row">
                      <i className="fas fa-calendar-alt"></i>
                      <span><strong>Ajánlat dátuma:</strong> {offer.date}</span>
                    </div>
                    <div className="ajanlataim-offer-row">
                      <i className="fas fa-clock"></i>
                      <span><strong>Érvényes:</strong> {offer.validUntil}</span>
                    </div>
                    
                    {offer.pumpa === 'Igen' && (
                      <div className="ajanlataim-offer-row">
                        <i className="fas fa-tint"></i>
                        <span><strong>Betonpumpa:</strong> Igen</span>
                      </div>
                    )}
                    
                    <div className="ajanlataim-offer-row ajanlataim-offer-price">
                      <i className="fas fa-tag"></i>
                      <span><strong>Nettó összeg:</strong> {offer.nettoPriceFormatted}</span>
                    </div>
                    <div className="ajanlataim-offer-row ajanlataim-offer-price">
                      <i className="fas fa-tag"></i>
                      <span><strong>Bruttó összeg:</strong> {offer.bruttoPriceFormatted}</span>
                    </div>
                    
                    {offer.details && (
                      <details className="ajanlataim-offer-details-expand">
                        <summary>Részletes költségek</summary>
                        <div className="ajanlataim-offer-details-section">
                          <div className="ajanlataim-offer-row">
                            <i className="fas fa-calculator"></i>
                            <span><strong>Beton költség:</strong> {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(offer.details.betonKoltseg)}</span>
                          </div>
                          {offer.pumpa === 'Igen' && (
                            <div className="ajanlataim-offer-row">
                              <i className="fas fa-calculator"></i>
                              <span><strong>Pumpa költség:</strong> {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(offer.details.pumpaKoltseg)}</span>
                            </div>
                          )}
                          {offer.betonszalText !== 'Nem szükséges' && (
                            <div className="ajanlataim-offer-row">
                              <i className="fas fa-calculator"></i>
                              <span><strong>Betonszál költség:</strong> {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(offer.details.betonszalKoltseg)}</span>
                            </div>
                          )}
                          <div className="ajanlataim-offer-row">
                            <i className="fas fa-truck"></i>
                            <span><strong>Szállítási költség:</strong> {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(offer.details.szallitasKoltseg)}</span>
                          </div>
                          <div className="ajanlataim-offer-row">
                            <i className="fas fa-percent"></i>
                            <span><strong>ÁFA (27%):</strong> {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(offer.details.afaOsszeg)}</span>
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="ajanlataim-no-offers">
                <i className="fas fa-file-invoice"></i>
                <h3>Nincsenek megjeleníthető ajánlatok ezzel a szűrővel</h3>
                <button className="ajanlataim-new-offer-btn" onClick={handleNewOffer}>
                 <i className="fas fa-plus-circle"></i>
                  Új ajánlat kérése
                </button>
              </div>
            )
          ) : (
            <div className="ajanlataim-no-offers">
              <i className="fas fa-file-invoice"></i>
              <h3>Még nincsenek ajánlataid</h3>
              <p>Kérj egy ajánlatot az alábbi gombra kattintva!</p>
              <button className="ajanlataim-new-offer-btn" onClick={handleNewOffer}>
                <k className="fas fa-plus-circle"></k>
                Új ajánlat kérése
              </button>
            </div>
          )}
        </div>
      </section>

      {showDeleteModal && (
        <div className="ajanlataim-modal-overlay" onClick={cancelDelete}>
          <div className="ajanlataim-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ajanlataim-modal-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Ajánlat törlése</h3>
            <p>Biztosan törölni szeretnéd ezt az ajánlatot?</p>
            <p className="ajanlataim-modal-offer">{offerToDelete?.number} - {offerToDelete?.company}</p>
            <div className="ajanlataim-modal-buttons">
              <button className="ajanlataim-modal-btn ajanlataim-modal-btn-cancel" onClick={cancelDelete}>
                Mégsem
              </button>
              <button className="ajanlataim-modal-btn ajanlataim-modal-btn-confirm" onClick={confirmDelete}>
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="ajanlataim-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8315 Meleghegyi utca 5., Gyenesdiás | <a href="tel:+36309973432">+36 30 997 3432</a> | <a href="mailto:info@betonlogisztika.hu">info@betonlogisztika.hu</a></p>

        <div className="ajanlataim-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="ajanlataim-social-icons">
          <a href="https://www.facebook.com/betonlogisztika/"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="ajanlataim-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Ajanlataim;