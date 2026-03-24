import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Megrendeles.css';

const Megrendeles = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
 
  const [shippingAddress, setShippingAddress] = useState({
    postalCode: '',
    city: '',
    street: '',
    houseNumber: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    postalCode: '',
    city: '',
    street: '',
    houseNumber: ''
  });
  
  const [addressErrors, setAddressErrors] = useState({});
  
  const [formData, setFormData] = useState({
    taxNumber: '',
    message: '',
    terms: false,
    privacy: false
  });

  const [formErrors, setFormErrors] = useState({});
  
  const [isModalActive, setIsModalActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const modalRef = useRef(null);

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
    loadValidOffers();
  }, []);

  useEffect(() => {
    if (location.state?.selectedOffer) {
      const offer = location.state.selectedOffer;
      setSelectedQuote(offer);
 
      setShippingAddress({
        postalCode: offer.iranyitoszam || '',
        city: offer.telepules || '',
        street: offer.utca || '',
        houseNumber: offer.hazszam || ''
      });
      
      console.log('Cím beállítva az ajánlatból:', offer);
    }
  }, [location.state]);

  const loadValidOffers = async () => {
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/bejelentkezes');
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
        const validOffers = data.ajanlatok.filter(offer => {
          const validUntil = new Date(offer.ervenyes_ig);
          return offer.statusz === 'elfogadva' && validUntil >= today;
        });
        
        setOffers(validOffers);
      } else {
        setError(data.message || 'Hiba történt az ajánlatok betöltése során!');
      }
    } catch (error) {
      console.error('❌ Hiba:', error);
      setError('Hálózati hiba!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddress({ ...shippingAddress });
    }
  }, [shippingAddress, billingSameAsShipping]);

  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.querySelector('.megrendeles-header');
      if (headerElement) {
        headerElement.style.padding = '0';
        headerElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
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

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    });
    
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: null
      });
    }
    setServerError('');
  };

  const handleShippingAddressChange = (e) => {
    const { id, value } = e.target;
    
    const fieldMap = {
      'shippingPostalCode': 'postalCode',
      'shippingCity': 'city',
      'shippingStreet': 'street',
      'shippingHouseNumber': 'houseNumber'
    };
    
    const stateField = fieldMap[id];
    
    setShippingAddress({
      ...shippingAddress,
      [stateField]: value
    });
    
    if (addressErrors[id]) {
      setAddressErrors({
        ...addressErrors,
        [id]: null
      });
    }
  };

  const handleBillingAddressChange = (e) => {
    const { id, value } = e.target;
    
    const fieldMap = {
      'billingPostalCode': 'postalCode',
      'billingCity': 'city',
      'billingStreet': 'street',
      'billingHouseNumber': 'houseNumber'
    };
    
    const stateField = fieldMap[id];
    
    setBillingAddress({
      ...billingAddress,
      [stateField]: value
    });
    
    if (addressErrors[id]) {
      setAddressErrors({
        ...addressErrors,
        [id]: null
      });
    }
  };

  const handleBillingSameChange = (e) => {
    const checked = e.target.checked;
    setBillingSameAsShipping(checked);
    if (checked) {
      setBillingAddress({ ...shippingAddress });
    } else {
      setBillingAddress({
        postalCode: '',
        city: '',
        street: '',
        houseNumber: ''
      });
    }
  };

  const handleQuoteSelect = (offer) => {
    setSelectedQuote(offer);
 
    setShippingAddress({
      postalCode: offer.iranyitoszam || '',
      city: offer.telepules || '',
      street: offer.utca || '',
      houseNumber: offer.hazszam || ''
    });
    
    console.log('Cím beállítva kiválasztáskor:', offer);
  };

  const validateAddresses = () => {
    const errors = {};
    let isValid = true;

    if (!shippingAddress.postalCode.trim()) {
      errors.shippingPostalCode = 'Kérjük, adja meg az irányítószámot!';
      isValid = false;
    }
    if (!shippingAddress.city.trim()) {
      errors.shippingCity = 'Kérjük, adja meg a települést!';
      isValid = false;
    }
    if (!shippingAddress.street.trim()) {
      errors.shippingStreet = 'Kérjük, adja meg az utcát!';
      isValid = false;
    }
    if (!shippingAddress.houseNumber.trim()) {
      errors.shippingHouseNumber = 'Kérjük, adja meg a házszámot!';
      isValid = false;
    }

    if (!billingSameAsShipping) {
      if (!billingAddress.postalCode.trim()) {
        errors.billingPostalCode = 'Kérjük, adja meg az irányítószámot!';
        isValid = false;
      }
      if (!billingAddress.city.trim()) {
        errors.billingCity = 'Kérjük, adja meg a települést!';
        isValid = false;
      }
      if (!billingAddress.street.trim()) {
        errors.billingStreet = 'Kérjük, adja meg az utcát!';
        isValid = false;
      }
      if (!billingAddress.houseNumber.trim()) {
        errors.billingHouseNumber = 'Kérjük, adja meg a házszámot!';
        isValid = false;
      }
    }

    setAddressErrors(errors);
    return isValid;
  };

  const isValidTaxNumber = (taxNumber) => {
    return /^[0-9]{8}-[0-9]-[0-9]{2}$/.test(taxNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    let isValid = true;

    if (!selectedQuote) {
      errors.selectedQuote = 'Kérjük, válasszon ki egy ajánlatot!';
      isValid = false;
    }

    if (!validateAddresses()) {
      isValid = false;
    }

    if (!formData.taxNumber.trim()) {
      errors.taxNumber = 'Kérjük, adja meg az adószámát!';
      isValid = false;
    } else if (!isValidTaxNumber(formData.taxNumber)) {
      errors.taxNumber = 'Kérjük, adjon meg érvényes adószámot (formátum: 12345678-1-23)!';
      isValid = false;
    }

    if (!formData.terms) {
      errors.terms = 'Kérjük, fogadja el az ÁSZF-et!';
      isValid = false;
    }

    if (!formData.privacy) {
      errors.privacy = 'Kérjük, fogadja el az Adatvédelmi Nyilatkozatot!';
      isValid = false;
    }

    setFormErrors(errors);

    if (!isValid) return;

    setIsSubmitting(true);
    setServerError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setServerError('Nincs bejelentkezve!');
      setIsSubmitting(false);
      return;
    }

    try {
      const requestBody = {
        ajanlat_id: selectedQuote.id,
        szallitas_iranyitoszam: shippingAddress.postalCode,
        szallitas_telepules: shippingAddress.city,
        szallitas_utca: shippingAddress.street,
        szallitas_hazszam: shippingAddress.houseNumber,
        szamlazasi_iranyitoszam: billingSameAsShipping ? shippingAddress.postalCode : billingAddress.postalCode,
        szamlazasi_telepules: billingSameAsShipping ? shippingAddress.city : billingAddress.city,
        szamlazasi_utca: billingSameAsShipping ? shippingAddress.street : billingAddress.street,
        szamlazasi_hazszam: billingSameAsShipping ? shippingAddress.houseNumber : billingAddress.houseNumber,
        adoszam: formData.taxNumber,
        megjegyzes: formData.message || null
      };

      console.log('📤 Küldött adatok:', requestBody);

      const response = await fetch('http://localhost:3000/api/megrendelesek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setIsModalActive(true);
      } else {
        setServerError(data.message || 'Hiba történt a megrendelés során!');
      }
    } catch (error) {
      console.error('❌ Hiba:', error);
      setServerError('Hálózati hiba!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalActive(false);
    navigate('/megrendeleim');
  };

  const handleModalClick = (e) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  return (
    <>
      <header className="megrendeles-header">
        <div className="megrendeles-header-container">
          <a href="/" className="megrendeles-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="megrendeles-logo-icon"></div>
            <div className="megrendeles-logo-text">BetonLogisztika</div>
          </a>
          <ul className="megrendeles-nav-menu">
            <li className="megrendeles-nav-item">
              <a href="/" className="megrendeles-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="megrendeles-nav-item">
              <a href="/megrendeles" className="megrendeles-nav-link active" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="megrendeles-nav-item">
              <a href="/ajanlatkeres" className="megrendeles-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="megrendeles-nav-item">
              <a href="/kapcsolat" className="megrendeles-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="megrendeles-nav-item">
              <a href="/partnereink" className="megrendeles-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
          </ul>
  
          <div className="megrendeles-account-menu">
            <div className="megrendeles-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`megrendeles-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="megrendeles-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="megrendeles-account-content">
       
                <a href="/megrendeleim" className="megrendeles-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>
 
                <a href="/ajanlataim" className="megrendeles-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>
          
                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="megrendeles-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}
        
                <button className="megrendeles-account-menu-item megrendeles-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="megrendeles-hero">
        <div className="megrendeles-hero-content">
          <h1>Beton megrendelés</h1>
          <p>Rendelje meg betonszállítását egyszerűen és gyorsan. Válasszon meglévő ajánlatából!</p>
        </div>
      </section>

      <section className="megrendeles-order-section">
        <h2 className="megrendeles-section-title">Megrendelés indítása</h2>
        
        <div className="megrendeles-order-container">
          <div className="megrendeles-quote-info">
            <h4>Elfogadott ajánlataim</h4>
            {isLoading ? (
              <div className="megrendeles-loading">
                <i className="fas fa-spinner fa-spin"></i> Betöltés...
              </div>
            ) : error ? (
              <div className="megrendeles-error">
                <p>{error}</p>
                <button className="megrendeles-btn" onClick={loadValidOffers}>Újra</button>
              </div>
            ) : offers.length > 0 ? (
              <ul className="megrendeles-quote-list">
                {offers.map(offer => (
                  <li 
                    key={offer.id}
                    className={`megrendeles-quote-item ${selectedQuote?.id === offer.id ? 'selected' : ''}`}
                    onClick={() => handleQuoteSelect(offer)}
                  >
                    <div className="megrendeles-quote-icon">
                      <i className="fas fa-file-invoice"></i>
                    </div>
                    <div className="megrendeles-quote-details">
                      <h5>{offer.ajanlatszam} - {offer.beton_tipus_nev}</h5>
                      <p>{offer.mennyiseg} m³ - {offer.telepules}</p>
                    </div>
                    <div className="megrendeles-quote-status">
                      <i className="fas fa-check-circle"></i> Elfogadva
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="megrendeles-no-quotes">
                <p>Nincsenek elfogadott ajánlataid.</p>
                <button className="megrendeles-btn" onClick={() => navigate('/ajanlatkeres')}>
                  Új ajánlat kérése
                </button>
              </div>
            )}
          </div>

          {selectedQuote && (
            <div className="megrendeles-order-summary">
              <h4>Kiválasztott ajánlat részletei</h4>
              <div className="megrendeles-summary-row">
                <span className="megrendeles-summary-label">Ajánlat száma:</span>
                <span className="megrendeles-summary-value">{selectedQuote.ajanlatszam}</span>
              </div>
              <div className="megrendeles-summary-row">
                <span className="megrendeles-summary-label">Beton típus:</span>
                <span className="megrendeles-summary-value">{selectedQuote.beton_tipus_nev}</span>
              </div>
              <div className="megrendeles-summary-row">
                <span className="megrendeles-summary-label">Mennyiség:</span>
                <span className="megrendeles-summary-value">{selectedQuote.mennyiseg} m³</span>
              </div>
              <div className="megrendeles-summary-row">
                <span className="megrendeles-summary-label">Betongyártó cég:</span>
                <span className="megrendeles-summary-value">{selectedQuote.betongyarto_nev}</span>
              </div>
              <div className="megrendeles-summary-row">
                <span className="megrendeles-summary-label">Szállítás dátuma:</span>
                <span className="megrendeles-summary-value">{new Date(selectedQuote.szallitas_datum).toLocaleDateString('hu-HU')}</span>
              </div>
              <div className="megrendeles-summary-row megrendeles-total-row">
                <span className="megrendeles-summary-label">Bruttó végösszeg:</span>
                <span className="megrendeles-summary-value">
                  {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(selectedQuote.brutto_osszeg)}
                </span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {formErrors.selectedQuote && (
              <div className="megrendeles-error-message visible" style={{ marginBottom: '20px' }}>
                {formErrors.selectedQuote}
              </div>
            )}

            <h3 style={{ margin: '30px 0 20px', color: '#2c3e50' }}>Szállítási cím</h3>
            <div className="megrendeles-form-row">
              <div className="megrendeles-form-group">
                <label htmlFor="shippingPostalCode">Irányítószám: <span className="megrendeles-required-badge">*</span></label>
                <input 
                  type="text" 
                  id="shippingPostalCode" 
                  className={`megrendeles-form-control ${addressErrors.shippingPostalCode ? 'error' : ''}`} 
                  value={shippingAddress.postalCode}
                  onChange={handleShippingAddressChange}
                  required
                />
                <div className={`megrendeles-error-message ${addressErrors.shippingPostalCode ? 'visible' : ''}`}>
                  {addressErrors.shippingPostalCode}
                </div>
              </div>
              <div className="megrendeles-form-group">
                <label htmlFor="shippingCity">Település: <span className="megrendeles-required-badge">*</span></label>
                <input 
                  type="text" 
                  id="shippingCity" 
                  className={`megrendeles-form-control ${addressErrors.shippingCity ? 'error' : ''}`} 
                  value={shippingAddress.city}
                  onChange={handleShippingAddressChange}
                  required
                />
                <div className={`megrendeles-error-message ${addressErrors.shippingCity ? 'visible' : ''}`}>
                  {addressErrors.shippingCity}
                </div>
              </div>
            </div>
            <div className="megrendeles-form-row">
              <div className="megrendeles-form-group">
                <label htmlFor="shippingStreet">Utca: <span className="megrendeles-required-badge">*</span></label>
                <input 
                  type="text" 
                  id="shippingStreet" 
                  className={`megrendeles-form-control ${addressErrors.shippingStreet ? 'error' : ''}`} 
                  value={shippingAddress.street}
                  onChange={handleShippingAddressChange}
                  required
                />
                <div className={`megrendeles-error-message ${addressErrors.shippingStreet ? 'visible' : ''}`}>
                  {addressErrors.shippingStreet}
                </div>
              </div>
              <div className="megrendeles-form-group">
                <label htmlFor="shippingHouseNumber">Házszám: <span className="megrendeles-required-badge">*</span></label>
                <input 
                  type="text" 
                  id="shippingHouseNumber" 
                  className={`megrendeles-form-control ${addressErrors.shippingHouseNumber ? 'error' : ''}`} 
                  value={shippingAddress.houseNumber}
                  onChange={handleShippingAddressChange}
                  required
                />
                <div className={`megrendeles-error-message ${addressErrors.shippingHouseNumber ? 'visible' : ''}`}>
                  {addressErrors.shippingHouseNumber}
                </div>
              </div>
            </div>

            <h3 style={{ margin: '30px 0 20px', color: '#2c3e50' }}>Számlázási cím</h3>
            <div className="megrendeles-checkbox-item" style={{ marginBottom: '20px' }}>
              <input 
                type="checkbox" 
                id="billingSame" 
                checked={billingSameAsShipping}
                onChange={handleBillingSameChange}
              />
              <label htmlFor="billingSame">Számlázási cím megegyezik a szállítási címmel</label>
            </div>

            {!billingSameAsShipping && (
              <>
                <div className="megrendeles-form-row">
                  <div className="megrendeles-form-group">
                    <label htmlFor="billingPostalCode">Irányítószám: <span className="megrendeles-required-badge">*</span></label>
                    <input 
                      type="text" 
                      id="billingPostalCode" 
                      className={`megrendeles-form-control ${addressErrors.billingPostalCode ? 'error' : ''}`} 
                      value={billingAddress.postalCode}
                      onChange={handleBillingAddressChange}
                      required
                    />
                    <div className={`megrendeles-error-message ${addressErrors.billingPostalCode ? 'visible' : ''}`}>
                      {addressErrors.billingPostalCode}
                    </div>
                  </div>
                  <div className="megrendeles-form-group">
                    <label htmlFor="billingCity">Település: <span className="megrendeles-required-badge">*</span></label>
                    <input 
                      type="text" 
                      id="billingCity" 
                      className={`megrendeles-form-control ${addressErrors.billingCity ? 'error' : ''}`} 
                      value={billingAddress.city}
                      onChange={handleBillingAddressChange}
                      required
                    />
                    <div className={`megrendeles-error-message ${addressErrors.billingCity ? 'visible' : ''}`}>
                      {addressErrors.billingCity}
                    </div>
                  </div>
                </div>
                <div className="megrendeles-form-row">
                  <div className="megrendeles-form-group">
                    <label htmlFor="billingStreet">Utca: <span className="megrendeles-required-badge">*</span></label>
                    <input 
                      type="text" 
                      id="billingStreet" 
                      className={`megrendeles-form-control ${addressErrors.billingStreet ? 'error' : ''}`} 
                      value={billingAddress.street}
                      onChange={handleBillingAddressChange}
                      required
                    />
                    <div className={`megrendeles-error-message ${addressErrors.billingStreet ? 'visible' : ''}`}>
                      {addressErrors.billingStreet}
                    </div>
                  </div>
                  <div className="megrendeles-form-group">
                    <label htmlFor="billingHouseNumber">Házszám: <span className="megrendeles-required-badge">*</span></label>
                    <input 
                      type="text" 
                      id="billingHouseNumber" 
                      className={`megrendeles-form-control ${addressErrors.billingHouseNumber ? 'error' : ''}`} 
                      value={billingAddress.houseNumber}
                      onChange={handleBillingAddressChange}
                      required
                    />
                    <div className={`megrendeles-error-message ${addressErrors.billingHouseNumber ? 'visible' : ''}`}>
                      {addressErrors.billingHouseNumber}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="megrendeles-form-group">
              <label htmlFor="taxNumber">Adószám: <span className="megrendeles-required-badge">*</span></label>
              <input 
                type="text" 
                id="taxNumber" 
                className={`megrendeles-form-control ${formErrors.taxNumber ? 'error' : ''}`} 
                placeholder="12345678-1-23"
                value={formData.taxNumber}
                onChange={handleInputChange}
                required
              />
              <div className={`megrendeles-error-message ${formErrors.taxNumber ? 'visible' : ''}`}>{formErrors.taxNumber}</div>
            </div>

            <div className="megrendeles-form-group">
              <label htmlFor="message">Egyéb megjegyzések:</label>
              <textarea 
                id="message" 
                className="megrendeles-form-control" 
                rows="4" 
                placeholder="Pl.: pontos kapcsolattartó, kapu kód, nehéz megközelítés..."
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
            </div>
       
            {serverError && (
              <div className="megrendeles-error-message visible" style={{ marginBottom: '15px', textAlign: 'center' }}>
                {serverError}
              </div>
            )}
       
            <div className="megrendeles-checkbox-group">
              <div className="megrendeles-checkbox-item">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className={formErrors.terms ? 'error' : ''}
                  checked={formData.terms}
                  onChange={handleInputChange}
                  required 
                />
                <label htmlFor="terms">Elfogadom az <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételeket.</a> <span className="megrendeles-required-badge">*</span></label>
              </div>
              <div className="megrendeles-checkbox-item">
                <input 
                  type="checkbox" 
                  id="privacy" 
                  className={formErrors.privacy ? 'error' : ''}
                  checked={formData.privacy}
                  onChange={handleInputChange}
                  required 
                />
                <label htmlFor="privacy">Elfogadom az <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi Nyilatkozatot</a> és hozzájárulok személyes adataim kezeléséhez.<span className="megrendeles-required-badge">*</span></label>
              </div>
            </div>
            <div className={`megrendeles-error-message ${formErrors.terms ? 'visible' : ''}`}>{formErrors.terms}</div>
            <div className={`megrendeles-error-message ${formErrors.privacy ? 'visible' : ''}`}>{formErrors.privacy}</div>
            
            <div className="megrendeles-submit-btn">
              <button type="submit" className="megrendeles-btn" disabled={!selectedQuote || isSubmitting}>
                {isSubmitting ? 'KÜLDÉS...' : 'Megrendelés véglegesítése'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className={`megrendeles-success-modal ${isModalActive ? 'active' : ''}`} ref={modalRef} onClick={handleModalClick}>
        <div className="megrendeles-modal-content">
          <div className="megrendeles-checkmark-circle">
            <i className="fas fa-check"></i>
          </div>
          <h2>Sikeres megrendelés!</h2>
          <p>Köszönjük megrendelését!</p>
          <p>A megrendelés megtekinthető a <a href="/megrendeleim" onClick={(e) => { e.preventDefault(); navigate('/megrendeleim'); }}>Megrendeléseim</a> menüpontban.</p>
          <button className="megrendeles-modal-close" onClick={closeModal}>Rendben</button>
        </div>
      </div>

      <footer className="megrendeles-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8315 Meleghegyi utca 5., Gyenesdiás | <a href="tel:+36309973432">+36 30 997 3432</a> | <a href="mailto:info@betonlogisztika.hu">info@betonlogisztika.hu</a></p>

        <div className="megrendeles-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="megrendeles-social-icons">
          <a href="https://www.facebook.com/betonlogisztika/"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="megrendeles-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Megrendeles;