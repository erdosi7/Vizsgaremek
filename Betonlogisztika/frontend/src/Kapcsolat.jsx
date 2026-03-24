import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Kapcsolat.css';

const Kapcsolat = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);
  const formRef = useRef(null);
 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    terms: false,
    privacy: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalActive, setIsSuccessModalActive] = useState(false);
  const [isErrorModalActive, setIsErrorModalActive] = useState(false);
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
    const handleScroll = () => {
      const headerElement = document.querySelector('.kapcsolat-header');
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
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Kérjük, adja meg a nevét!';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Kérjük, adja meg az e-mail címét!';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Kérjük, adjon meg érvényes e-mail címet!';
      isValid = false;
    }

    if (!formData.subject) {
      errors.subject = 'Kérjük, válassza ki a tárgyat!';
      isValid = false;
    }

    if (!formData.message.trim()) {
      errors.message = 'Kérjük, írja be az üzenetét!';
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

    if (isValid) {
      setIsSubmitting(true);
      
      try {
        const templateParams = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || 'Nem megadott',
          subject: formData.subject,
          message: formData.message
        };

        await emailjs.send(
          'betonlogisztika_service',
          'template_xhhf8jb',
          templateParams,
          'R4slKVev0JlgmJ-HT'
        );

        setIsSuccessModalActive(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          terms: false,
          privacy: false
        });
        
      } catch (error) {
        console.error('Email küldési hiba:', error);
        setIsErrorModalActive(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const closeModal = () => {
    setIsSuccessModalActive(false);
    setIsErrorModalActive(false);
    setFormErrors({});
  };

  const handleModalClick = (e) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  return (
    <>
      <header className="kapcsolat-header">
        <div className="kapcsolat-header-container">
          <a href="/" className="kapcsolat-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="kapcsolat-logo-icon"></div>
            <div className="kapcsolat-logo-text">BetonLogisztika</div>
          </a>
          <ul className="kapcsolat-nav-menu">
            <li className="kapcsolat-nav-item">
              <a href="/" className="kapcsolat-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="kapcsolat-nav-item">
              <a href="/megrendeles" className="kapcsolat-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="kapcsolat-nav-item">
              <a href="/ajanlatkeres" className="kapcsolat-nav-link" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="kapcsolat-nav-item">
              <a href="/kapcsolat" className="kapcsolat-nav-link active" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="kapcsolat-nav-item">
              <a href="/partnereink" className="kapcsolat-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
          </ul>

          <div className="kapcsolat-account-menu">
            <div className="kapcsolat-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`kapcsolat-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="kapcsolat-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="kapcsolat-account-content">

                <a href="/megrendeleim" className="kapcsolat-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i>
                  <span>Megrendeléseim</span>
                </a>

                <a href="/ajanlataim" className="kapcsolat-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
                  <span>Ajánlataim</span>
                </a>
 
                {user?.jogosultsag === 'admin' && (
                  <a href="/admin" className="kapcsolat-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                    <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
                    <span>Admin Dashboard</span>
                  </a>
                )}

                <button className="kapcsolat-account-menu-item kapcsolat-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="kapcsolat-hero">
        <div className="kapcsolat-hero-content">
          <h1>Lépjen kapcsolatba velünk</h1>
          <p>Kérdése van vagy segítségre van szüksége? Szívesen állunk rendelkezésére!</p>
        </div>
      </section>

      <section className="kapcsolat-container">
        <h2 className="kapcsolat-section-title">Kapcsolat</h2>
        
        <div className="kapcsolat-grid">
          <div className="kapcsolat-info">
            <h3>Elérhetőségeink</h3>
            
            <div className="kapcsolat-detail">
              <div className="kapcsolat-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="kapcsolat-text">
                <h4>Cím</h4>
                <p>8360 Keszthely, Pajta alja utca 10.</p>
              </div>
            </div>
            
            <div className="kapcsolat-detail">
              <div className="kapcsolat-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="kapcsolat-text">
                <h4>Telefon</h4>
                <p>+36 83 123 456</p>
                <p>+36 30 997 3432 (ügyelet)</p>
              </div>
            </div>
            
            <div className="kapcsolat-detail">
              <div className="kapcsolat-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="kapcsolat-text">
                <h4>E-mail</h4>
                <p>betonlgs@gmail.com</p>
                <p>info@betonlogisztika.hu</p>
              </div>
            </div>
            
            <div className="kapcsolat-detail">
              <div className="kapcsolat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="kapcsolat-text">
                <h4>Nyitvatartás</h4>
                <p>Hétfő - Péntek: 7:00 - 16:00</p>
                <p>Szombat: 8:00 - 12:00</p>
                <p>Vasárnap: Zárva</p>
              </div>
            </div>
            
            <div className="kapcsolat-detail">
              <div className="kapcsolat-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="kapcsolat-text">
                <h4>Ügyelet</h4>
                <p>Ügyeleti szám: +36 30 997 3432</p>
                <p>Hétvégén és ünnepnapokon is elérhető</p>
              </div>
            </div>
          </div>
          
          <div className="kapcsolat-form">
            <h3>Küldjön üzenetet</h3>
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="kapcsolat-form-group">
                <label htmlFor="name">Név: <span className="kapcsolat-required">*</span></label>
                <input 
                  type="text" 
                  id="name" 
                  className={`kapcsolat-form-control ${formErrors.name ? 'error' : ''}`} 
                  placeholder="Kérjük, adja meg a nevét"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <div className={`kapcsolat-error-message ${formErrors.name ? 'visible' : ''}`}>{formErrors.name}</div>
              </div>
              
              <div className="kapcsolat-form-group">
                <label htmlFor="email">E-mail cím:<span className="kapcsolat-required">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  className={`kapcsolat-form-control ${formErrors.email ? 'error' : ''}`} 
                  placeholder="pelda@email.hu"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <div className={`kapcsolat-error-message ${formErrors.email ? 'visible' : ''}`}>{formErrors.email}</div>
              </div>
              
              <div className="kapcsolat-form-group">
                <label htmlFor="phone">Telefonszám:</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="kapcsolat-form-control" 
                  placeholder="+36 30 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="kapcsolat-form-group">
                <label htmlFor="subject">Tárgy: <span className="kapcsolat-required">*</span></label>
                <select 
                  id="subject" 
                  className={`kapcsolat-form-control ${formErrors.subject ? 'error' : ''}`} 
                  value={formData.subject}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="">Válasszon...</option>
                  <option value="Ajánlatkérés">Ajánlatkérés</option>
                  <option value="Megrendelés">Megrendelés</option>
                  <option value="Reklamáció">Reklamáció</option>
                  <option value="Információ">Információ</option>
                  <option value="Egyéb">Egyéb</option>
                </select>
                <div className={`kapcsolat-error-message ${formErrors.subject ? 'visible' : ''}`}>{formErrors.subject}</div>
              </div>
              
              <div className="kapcsolat-form-group">
                <label htmlFor="message">Üzenet: <span className="kapcsolat-required">*</span></label>
                <textarea 
                  id="message" 
                  className={`kapcsolat-form-control ${formErrors.message ? 'error' : ''}`} 
                  rows="5" 
                  placeholder="Írja le üzenetét..."
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                ></textarea>
                <div className={`kapcsolat-error-message ${formErrors.message ? 'visible' : ''}`}>{formErrors.message}</div>
              </div>

              <div className="kapcsolat-checkbox-group">
                <div className="kapcsolat-checkbox-item">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className={formErrors.terms ? 'error' : ''}
                    checked={formData.terms}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required 
                  />
                  <label htmlFor="terms">Elfogadom az <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételeket.</a> <span className="kapcsolat-required">*</span></label>
                </div>
                <div className="kapcsolat-checkbox-item">
                  <input 
                    type="checkbox" 
                    id="privacy" 
                    className={formErrors.privacy ? 'error' : ''}
                    checked={formData.privacy}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required 
                  />
                  <label htmlFor="privacy">Elfogadom az <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi Nyilatkozatot</a> és hozzájárulok személyes adataim kezeléséhez. <span className="kapcsolat-required">*</span></label>
                </div>
              </div>
              <div className={`kapcsolat-error-message ${formErrors.terms ? 'visible' : ''}`}>{formErrors.terms}</div>
              <div className={`kapcsolat-error-message ${formErrors.privacy ? 'visible' : ''}`}>{formErrors.privacy}</div>
              
              <button type="submit" className="kapcsolat-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Küldés...' : 'Üzenet küldése'}
              </button>
            </form>
          </div>
        </div>
        
   <div className="kapcsolat-map-container">
  <iframe 
    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3681.1444850040466!2d17.24749624949876!3d46.77725340766365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1shu!2shu!4v1772569277554!5m2!1shu!2shu" 
    allowFullScreen 
    loading="lazy" 
    referrerPolicy="no-referrer-when-downgrade"
    title="BetonLogisztika térkép"
    style={{ border: 0, width: '100%', height: '650px' }}
  ></iframe>
  <div className="kapcsolat-custom-marker">
    <i className="fas fa-map-marker-alt"></i> BetonLogisztika
  </div>
</div>
      </section>
      
      <section className="kapcsolat-mixers-section">
        <div className="kapcsolat-mixers-container">
          <h2 className="kapcsolat-section-title">Betonkeverőink</h2>
          <div className="kapcsolat-mixers-grid">
            <div className="kapcsolat-mixer-card">
              <div className="kapcsolat-mixer-img" style={{backgroundImage: "url('/images/3.jpg')"}}></div>
              <div className="kapcsolat-mixer-content">
                <h3>Mixer (AADS-906)</h3>
                <p>8x4 hajtású, 8 m³ betonkeverő</p>
                <div className="kapcsolat-mixer-specs">
                  <ul>
                    <li><i className="fas fa-cube"></i> Kapacitás: 8 m³</li>
                    <li><i className="fas fa-tachometer-alt"></i> Fordulatszám: 15 rpm</li>
                    <li><i className="fas fa-weight"></i> Önsúly: 32 tonna</li>
                    <li><i className="fas fa-road"></i> Hajtás: 8x4</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="kapcsolat-mixer-card">
              <div className="kapcsolat-mixer-img" style={{backgroundImage: "url('/images/2.jpg')"}}></div>
              <div className="kapcsolat-mixer-content">
                <h3>Mixer (AADS-907)</h3>
                <p>6x4 hajtású, 8 m³ betonkeverő</p>
                <div className="kapcsolat-mixer-specs">
                  <ul>
                    <li><i className="fas fa-cube"></i> Kapacitás: 8 m³</li>
                    <li><i className="fas fa-tachometer-alt"></i> Fordulatszám: 14 rpm</li>
                    <li><i className="fas fa-weight"></i> Önsúly: 32 tonna</li>
                    <li><i className="fas fa-road"></i> Hajtás: 6x4</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="kapcsolat-mixer-card">
              <div className="kapcsolat-mixer-img" style={{backgroundImage: "url('/images/1.jpg')"}}></div>
              <div className="kapcsolat-mixer-content">
                <h3>Mixer (AAGI-576)</h3>
                <p>8x4 hajtású, 8 m³ betonkeverő</p>
                <div className="kapcsolat-mixer-specs">
                  <ul>
                    <li><i className="fas fa-cube"></i> Kapacitás: 8 m³</li>
                    <li><i className="fas fa-tachometer-alt"></i> Fordulatszám: 16 rpm</li>
                    <li><i className="fas fa-weight"></i> Önsúly: 32 tonna</li>
                    <li><i className="fas fa-road"></i> Hajtás: 8x4</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="kapcsolat-mixer-card">
              <div className="kapcsolat-mixer-img" style={{backgroundImage: "url('/images/4.jpg')"}}></div>
              <div className="kapcsolat-mixer-content">
                <h3>Mixer (SSH-736)</h3>
                <p>6x4 hajtású, 8 m³ betonkeverő</p>
                <div className="kapcsolat-mixer-specs">
                  <ul>
                    <li><i className="fas fa-cube"></i> Kapacitás: 8 m³</li>
                    <li><i className="fas fa-tachometer-alt"></i> Fordulatszám: 15 rpm</li>
                    <li><i className="fas fa-weight"></i> Önsúly: 32 tonna</li>
                    <li><i className="fas fa-road"></i> Hajtás: 6x4</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="kapcsolat-mixer-card">
              <div className="kapcsolat-mixer-img" style={{backgroundImage: "url('/images/5.jpg')"}}></div>
              <div className="kapcsolat-mixer-content">
                <h3>Mixer (NRA-815)</h3>
                <p>6x4 hajtású, 8 m³ betonkeverő</p>
                <div className="kapcsolat-mixer-specs">
                  <ul>
                    <li><i className="fas fa-cube"></i> Kapacitás: 8 m³</li>
                    <li><i className="fas fa-tachometer-alt"></i> Fordulatszám: 15 rpm</li>
                    <li><i className="fas fa-weight"></i> Önsúly: 32 tonna</li>
                    <li><i className="fas fa-road"></i> Hajtás: 6x4</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="kapcsolat-mixer-card">
              <div className="kapcsolat-mixer-img" style={{backgroundImage: "url('/images/6.jpg')"}}></div>
              <div className="kapcsolat-mixer-content">
                <h3>Mixer (NXM-037)</h3>
                <p>6x4 hajtású, 8 m³ betonkeverő</p>
                <div className="kapcsolat-mixer-specs">
                  <ul>
                    <li><i className="fas fa-cube"></i> Kapacitás: 8 m³</li>
                    <li><i className="fas fa-tachometer-alt"></i> Fordulatszám: 15 rpm</li>
                    <li><i className="fas fa-weight"></i> Önsúly: 32 tonna</li>
                    <li><i className="fas fa-road"></i> Hajtás: 6x4</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={`kapcsolat-success-modal ${isSuccessModalActive ? 'active' : ''}`} ref={modalRef} onClick={handleModalClick}>
        <div className="kapcsolat-modal-content">
          <div className="kapcsolat-checkmark">
            <i className="fas fa-check"></i>
          </div>
          <h3>Sikeres üzenetküldés!</h3>
          <p>Köszönjük az üzenetét! Hamarosan felvesszük Önnel a kapcsolatot.</p>
          <button className="kapcsolat-modal-close" onClick={closeModal}>Rendben</button>
        </div>
      </div>

      <div className={`kapcsolat-success-modal ${isErrorModalActive ? 'active' : ''}`} ref={modalRef} onClick={handleModalClick}>
        <div className="kapcsolat-modal-content">
          <div className="kapcsolat-checkmark" style={{background: '#e74c3c'}}>
            <i className="fas fa-times"></i>
          </div>
          <h3>Sikertelen üzenetküldés!</h3>
          <p>Valami hiba történt. Kérjük, próbálja újra később, vagy vegye fel velünk a kapcsolatot telefonon.</p>
          <button className="kapcsolat-modal-close" onClick={() => setIsErrorModalActive(false)}>Rendben</button>
        </div>
      </div>

      <footer className="kapcsolat-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8360 Keszthely, Pajta alja utca 10. | <a href="tel:+363083123456">+36 83 123 456</a> | <a href="mailto:betonlgs@gmail.com">betonlgs@gmail.com</a></p>

        <div className="kapcsolat-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="kapcsolat-social-icons">
          <a href="https://www.facebook.com/betonlogisztika" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="kapcsolat-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Kapcsolat;