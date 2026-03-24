import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Megrendeleim.css';

const Megrendeleim = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);

  const [filterStatus, setFilterStatus] = useState('all');

  const [isAdmin, setIsAdmin] = useState(false);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUserData();
    loadOrders();
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

  const loadOrders = async () => {
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/bejelentkezes');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/megrendeleim', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        
        const processedOrders = data.megrendelesek.map(order => {
          let statusClass = '';
          switch(order.statusz) {
            case 'feldolgozás alatt': statusClass = 'processing'; break;
            case 'szállítás alatt': statusClass = 'shipping'; break;
            case 'véglegesítve': statusClass = 'completed'; break;
            case 'sikertelen': statusClass = 'failed'; break;
            default: statusClass = 'processing';
          }

          return {
            id: order.id,
            number: order.megrendeles_szam,
            offerNumber: order.ajanlatszam,
            date: new Date(order.letrehozas_datum).toLocaleDateString('hu-HU'),
            deliveryDate: new Date(order.szallitas_datum).toLocaleDateString('hu-HU'),
            type: order.beton_tipus_nev || 'Ismeretlen',
            typeText: order.beton_tipus_nev || 'Ismeretlen',
            quantity: order.mennyiseg + ' m³',
            company: order.betongyarto_nev || 'Ismeretlen',
            location: `${order.szallitas_iranyitoszam} ${order.szallitas_telepules}, ${order.szallitas_utca} ${order.szallitas_hazszam}`,
            taxNumber: order.adoszam,
            message: order.megjegyzes,
            price: order.brutto_osszeg,
            priceFormatted: new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(order.brutto_osszeg),
            status: order.statusz,
            statusClass: statusClass
          };
        });

        setOrders(processedOrders);
      } else {
        setError(data.message || 'Hiba történt a megrendelések betöltése során!');
      }
    } catch (error) {
      console.error('❌ Hiba:', error);
      setError('Hálózati hiba!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token || !isAdmin) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/megrendelesek/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statusz: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        let statusClass = '';
        switch(newStatus) {
          case 'feldolgozás alatt': statusClass = 'processing'; break;
          case 'szállítás alatt': statusClass = 'shipping'; break;
          case 'véglegesítve': statusClass = 'completed'; break;
          case 'sikertelen': statusClass = 'failed'; break;
          default: statusClass = 'processing';
        }

        setOrders(orders.map(order => {
          if (order.id === orderId) {
            return { 
              ...order, 
              status: newStatus, 
              statusClass: statusClass 
            };
          }
          return order;
        }));
      } else {
        alert(data.message || 'Hiba történt a státusz módosítása során!');
      }
    } catch (error) {
      console.error('❌ Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleDeleteClick = (order) => {
    if (order.statusClass !== 'failed') {
      alert('Csak sikertelen státuszú megrendelés törölhető!');
      return;
    }
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/megrendelesek/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(orders.filter(order => order.id !== orderToDelete.id));
        setShowDeleteModal(false);
        setOrderToDelete(null);
        alert('✅ Megrendelés sikeresen törölve!');
      } else {
        alert(data.message || 'Hiba történt a törlés során!');
      }
    } catch (error) {
      console.error('❌ Hiba a törléskor:', error);
      alert('Hálózati hiba!');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.querySelector('.megrendeleim-header');
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

  const getFilteredOrders = () => {
    if (filterStatus === 'all') return orders;
    return orders.filter(order => order.statusClass === filterStatus);
  };

  const getStatusBadgeClass = (statusClass) => {
    switch(statusClass) {
      case 'processing': return 'processing';
      case 'shipping': return 'shipping';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      default: return '';
    }
  };

  const getStatusIcon = (statusClass) => {
    switch(statusClass) {
      case 'processing': return 'fa-clock';
      case 'shipping': return 'fa-truck';
      case 'completed': return 'fa-check-circle';
      case 'failed': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  };

  return (
    <>
      <header className="megrendeleim-header">
        <div className="megrendeleim-header-container">
          <a href="/" className="megrendeleim-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="megrendeleim-logo-icon"></div>
            <div className="megrendeleim-logo-text">BetonLogisztika</div>
          </a>
          <ul className="megrendeleim-nav-menu">
            <li className="megrendeleim-nav-item">
              <a href="/" className="megrendeleim-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="megrendeleim-nav-item">
              <a href="/megrendeles" className="megrendeleim-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="megrendeleim-nav-item">
              <a href="/ajanlatkeres" className="megrendeleim-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="megrendeleim-nav-item">
              <a href="/kapcsolat" className="megrendeleim-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="megrendeleim-nav-item">
              <a href="/partnereink" className="megrendeleim-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
          </ul>

          <div className="megrendeleim-account-menu">
            <div className="megrendeleim-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`megrendeleim-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="megrendeleim-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="megrendeleim-account-content">
 
                <a href="/megrendeleim" className="megrendeleim-account-menu-item active" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>

                <a href="/ajanlataim" className="megrendeleim-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>

                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="megrendeleim-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}

                <button className="megrendeleim-account-menu-item megrendeleim-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="megrendeleim-hero">
        <div className="megrendeleim-hero-content">
          <h1>Megrendeléseim</h1>
          <p>Összes megrendelésed áttekintése és követése.</p>
        </div>
      </section>

      <section className="megrendeleim-container">

        {isAdmin && (
          <div className="megrendeleim-admin-badge">
            <i className="fas fa-crown"></i> Admin mód
          </div>
        )}

        <div className="megrendeleim-filter">
          <button 
            className={`megrendeleim-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Összes ({orders.length})
          </button>
          <button 
            className={`megrendeleim-filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('processing')}
          >
            Feldolgozás alatt ({orders.filter(o => o.statusClass === 'processing').length})
          </button>
          <button 
            className={`megrendeleim-filter-btn ${filterStatus === 'shipping' ? 'active' : ''}`}
            onClick={() => setFilterStatus('shipping')}
          >
            Szállítás alatt ({orders.filter(o => o.statusClass === 'shipping').length})
          </button>
          <button 
            className={`megrendeleim-filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Véglegesítve ({orders.filter(o => o.statusClass === 'completed').length})
          </button>
          <button 
            className={`megrendeleim-filter-btn ${filterStatus === 'failed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('failed')}
          >
            Sikertelen ({orders.filter(o => o.statusClass === 'failed').length})
          </button>
        </div>

        <div className="megrendeleim-orders">
          {isLoading ? (
            <div className="megrendeleim-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Megrendelések betöltése...</p>
            </div>
          ) : error ? (
            <div className="megrendeleim-error">
              <i className="fas fa-exclamation-circle"></i>
              <h3>Hiba történt</h3>
              <p>{error}</p>
              <button className="megrendeleim-btn" onClick={loadOrders}>Újra</button>
            </div>
          ) : orders.length > 0 ? (
            getFilteredOrders().length > 0 ? (
              getFilteredOrders().map(order => (
                <div key={order.id} className={`megrendeleim-order-card ${order.statusClass}`}>
                  <div className="megrendeleim-order-header">
                    <div className="megrendeleim-order-title">
                      <h3>{order.number}</h3>
                      <span className={`megrendeleim-status-badge ${getStatusBadgeClass(order.statusClass)}`}>
                        <i className={`fas ${getStatusIcon(order.statusClass)}`}></i> {order.status}
                      </span>
                    </div>
                    <div className="megrendeleim-order-actions">

                      {order.statusClass === 'failed' && (
                        <button 
                          className="megrendeleim-order-btn-delete"
                          onClick={() => handleDeleteClick(order)}
                          title="Megrendelés törlése"
                        >
                          <i className="fas fa-times-circle"></i>
                        </button>
                      )}

                      {isAdmin && (
                        <select 
                          className="megrendeleim-status-select"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="feldolgozás alatt">Feldolgozás alatt</option>
                          <option value="szállítás alatt">Szállítás alatt</option>
                          <option value="véglegesítve">Véglegesítve</option>
                          <option value="sikertelen">Sikertelen</option>
                        </select>
                      )}
                    </div>
                  </div>
                  
                  <div className="megrendeleim-order-details">
                    <div className="megrendeleim-order-row">
                      <i className="fas fa-calendar-alt"></i>
                      <span><strong>Megrendelés dátuma:</strong> {order.date}</span>
                    </div>
                    <div className="megrendeleim-order-row">
                      <i className="fas fa-file-invoice"></i>
                      <span><strong>Ajánlat száma:</strong> {order.offerNumber}</span>
                    </div>
                    <div className="megrendeleim-order-row">
                      <i className="fas fa-cube"></i>
                      <span><strong>Beton típus:</strong> {order.typeText}</span>
                    </div>
                    <div className="megrendeleim-order-row">
                      <i className="fas fa-weight"></i>
                      <span><strong>Mennyiség:</strong> {order.quantity}</span>
                    </div>
                    <div className="megrendeleim-order-row">
                      <i className="fas fa-building"></i>
                      <span><strong>Betongyártó:</strong> {order.company}</span>
                    </div>
                    <div className="megrendeleim-order-row">
                      <i className="fas fa-map-marker-alt"></i>
                      <span><strong>Helyszín:</strong> {order.location}</span>
                    </div>
                    <div className="megrendeleim-order-row">
                      <i className="fas fa-truck"></i>
                      <span><strong>Szállítás időpontja:</strong> {order.deliveryDate}</span>
                    </div>
                    {order.taxNumber && (
                      <div className="megrendeleim-order-row">
                        <i className="fas fa-id-card"></i>
                        <span><strong>Adószám:</strong> {order.taxNumber}</span>
                      </div>
                    )}
                    {order.message && (
                      <div className="megrendeleim-order-row">
                        <i className="fas fa-comment"></i>
                        <span><strong>Megjegyzés:</strong> {order.message}</span>
                      </div>
                    )}
                    <div className="megrendeleim-order-row megrendeleim-order-price">
                      <i className="fas fa-tag"></i>
                      <span><strong>Végösszeg:</strong> {order.priceFormatted}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="megrendeleim-no-orders">
                <i className="fas fa-box-open" style={{ fontSize: '60px', color: '#4fc3f7', marginBottom: '20px' }}></i>
                <h3>Nincsenek megjeleníthető megrendelések ezzel a szűrővel</h3>
                <button className="megrendeleim-new-order-btn" onClick={() => navigate('/ajanlatkeres')}>
                  <i className="fas fa-plus-circle"></i>
                  Új ajánlat kérése
                </button>
              </div>
            )
          ) : (
            <div className="megrendeleim-no-orders">
              <i className="fas fa-box-open" style={{ fontSize: '60px', color: '#4fc3f7', marginBottom: '20px' }}></i>
              <h3>Még nincsenek megrendeléseid</h3>
              <p>Ha van érvényes ajánlatod, a Megrendelés oldalon leadhatod a megrendelést!</p>
              <button className="megrendeleim-new-order-btn" onClick={() => navigate('/ajanlatkeres')}>
                <i className="fas fa-plus-circle"></i>
                Új ajánlat kérése
              </button>
            </div>
          )}
        </div>
      </section>

      {showDeleteModal && (
        <div className="megrendeleim-modal-overlay" onClick={cancelDelete}>
          <div className="megrendeleim-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="megrendeleim-modal-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Megrendelés törlése</h3>
            <p>Biztosan törölni szeretnéd ezt a megrendelést?</p>
            <p className="megrendeleim-modal-order">{orderToDelete?.number} - {orderToDelete?.company}</p>
            <div className="megrendeleim-modal-buttons">
              <button className="megrendeleim-modal-btn megrendeleim-modal-btn-cancel" onClick={cancelDelete} disabled={isDeleting}>
                Mégsem
              </button>
              <button className="megrendeleim-modal-btn megrendeleim-modal-btn-confirm" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Törlés...' : 'Törlés'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="megrendeleim-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8315 Meleghegyi utca 5., Gyenesdiás | <a href="tel:+36309973432">+36 30 997 3432</a> | <a href="mailto:info@betonlogisztika.hu">info@betonlogisztika.hu</a></p>

        <div className="megrendeleim-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="megrendeleim-social-icons">
          <a href="https://www.facebook.com/betonlogisztika/"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="megrendeleim-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Megrendeleim;