import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Regisztracio.css';

const Regisztracio = () => {
  const navigate = useNavigate();
  
  // Regisztrációs űrlap state
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    terms: false,
    privacy: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);

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

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validáció
    const errors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = 'Kérjük, adja meg a teljes nevét!';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Kérjük, adja meg az e-mail címét!';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Kérjük, adjon meg érvényes e-mail címet!';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Kérjük, adja meg a telefonszámát!';
      isValid = false;
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = 'Kérjük, adjon meg érvényes telefonszámot!';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Kérjük, adja meg a jelszót!';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie!';
      isValid = false;
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Kérjük, erősítse meg a jelszót!';
      isValid = false;
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'A jelszavak nem egyeznek!';
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
    setServerError('');

    if (!isValid) return;

    // Backend hívás
    setIsLoading(true);

    try {
      console.log('Küldött adatok:', {
        nev: formData.fullName,
        email: formData.email,
        jelszo: formData.password,
        cegnev: formData.companyName || null,
        telefon: formData.phone
      });

      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nev: formData.fullName,
          email: formData.email,
          jelszo: formData.password,
          cegnev: formData.companyName || null,
          telefon: formData.phone
        }),
      });

      const data = await response.json();
      console.log('Szerver válasz:', data);

      if (data.success) {
        setIsSuccess(true);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/');
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setServerError(data.message || 'Regisztrációs hiba történt!');
      }
    } catch (error) {
      console.error('Regisztrációs hiba:', error);
      setServerError('Hálózati hiba. Kérjük, próbálja újra később!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="regisztracio-page">
      <div className="regisztracio-container">
        <div className="regisztracio-card">
          <div className="regisztracio-logo-container">
            <div className="regisztracio-logo"></div>
            <h1>BetonLogisztika</h1>
          </div>
          
          <h2 className="regisztracio-title">Regisztráció</h2>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="regisztracio-form-row">
              <div className="regisztracio-form-group">
                <label htmlFor="fullName">Teljes név: <span className="regisztracio-required">*</span></label>
                <div className="regisztracio-input-wrapper">
                  <i className="fas fa-user"></i>
                  <input
                    type="text"
                    id="fullName"
                    className={`regisztracio-form-control ${formErrors.fullName ? 'error' : ''}`}
                    placeholder="Pl.: Nagy János"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.fullName && <div className="regisztracio-error-message visible">{formErrors.fullName}</div>}
              </div>

              <div className="regisztracio-form-group">
                <label htmlFor="companyName">Cégnév (opcionális):</label>
                <div className="regisztracio-input-wrapper">
                  <i className="fas fa-building"></i>
                  <input
                    type="text"
                    id="companyName"
                    className="regisztracio-form-control"
                    placeholder="Pl.: Kft., Bt., stb."
                    value={formData.companyName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="regisztracio-form-row">
              <div className="regisztracio-form-group">
                <label htmlFor="email">E-mail cím: <span className="regisztracio-required">*</span></label>
                <div className="regisztracio-input-wrapper">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    className={`regisztracio-form-control ${formErrors.email ? 'error' : ''}`}
                    placeholder="pelda@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.email && <div className="regisztracio-error-message visible">{formErrors.email}</div>}
              </div>

              <div className="regisztracio-form-group">
                <label htmlFor="phone">Telefonszám: <span className="regisztracio-required">*</span></label>
                <div className="regisztracio-input-wrapper">
                  <i className="fas fa-phone"></i>
                  <input
                    type="tel"
                    id="phone"
                    className={`regisztracio-form-control ${formErrors.phone ? 'error' : ''}`}
                    placeholder="+36 30 123 4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.phone && <div className="regisztracio-error-message visible">{formErrors.phone}</div>}
              </div>
            </div>

            <div className="regisztracio-form-row">
              <div className="regisztracio-form-group">
                <label htmlFor="password">Jelszó: <span className="regisztracio-required">*</span></label>
                <div className="regisztracio-password-wrapper">
                  <div className="regisztracio-input-wrapper">
                    <i className="fas fa-lock"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`regisztracio-form-control ${formErrors.password ? 'error' : ''}`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="regisztracio-toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {formErrors.password && <div className="regisztracio-error-message visible">{formErrors.password}</div>}
              </div>

              <div className="regisztracio-form-group">
                <label htmlFor="passwordConfirm">Jelszó megerősítése: <span className="regisztracio-required">*</span></label>
                <div className="regisztracio-password-wrapper">
                  <div className="regisztracio-input-wrapper">
                    <i className="fas fa-lock"></i>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="passwordConfirm"
                      className={`regisztracio-form-control ${formErrors.passwordConfirm ? 'error' : ''}`}
                      placeholder="••••••••"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="regisztracio-toggle-password" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <i className={`far ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {formErrors.passwordConfirm && <div className="regisztracio-error-message visible">{formErrors.passwordConfirm}</div>}
              </div>
            </div>

            {serverError && (
              <div className="regisztracio-error-message visible" style={{ textAlign: 'center', marginBottom: '15px' }}>
                {serverError}
              </div>
            )}

            <div className="regisztracio-checkbox-group">
              <div className="regisztracio-checkbox-item">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className={formErrors.terms ? 'error' : ''}
                  checked={formData.terms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="terms">
                  Elfogadom az <a href="/alt_szer_felt" onClick={(e) => handleLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételeket.</a> <span className="regisztracio-required">*</span>
                </label>
              </div>
              <div className="regisztracio-checkbox-item">
                <input 
                  type="checkbox" 
                  id="privacy" 
                  className={formErrors.privacy ? 'error' : ''}
                  checked={formData.privacy}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="privacy">
                  Elfogadom az <a href="/adatvedelmi_nyil" onClick={(e) => handleLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi Nyilatkozatot</a> és hozzájárulok személyes adataim kezeléséhez. <span className="regisztracio-required">*</span>
                </label>
              </div>
            </div>
            <div className={`regisztracio-error-message ${formErrors.terms ? 'visible' : ''}`}>{formErrors.terms}</div>
            <div className={`regisztracio-error-message ${formErrors.privacy ? 'visible' : ''}`}>{formErrors.privacy}</div>

            <button type="submit" className="regisztracio-btn-signup" disabled={isLoading}>
              {isLoading ? 'REGISZTRÁCIÓ...' : 'Regisztráció'}
            </button>
          </form>

          <div className="regisztracio-login-link">
            <p>Már van fiókod? <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Jelentkezz be!</a></p>
          </div>
        </div>
      </div>

      {isSuccess && (
        <div className="regisztracio-success-overlay" style={{ display: 'flex' }}>
          <div className="regisztracio-success-content">
            <div className="regisztracio-checkmark-circle">
              <i className="fas fa-check"></i>
            </div>
            <h2>Sikeres regisztráció!</h2>
            <p>Köszönjük, hogy regisztráltál a BetonLogisztika oldalán!</p>
            <div className="regisztracio-loader"></div>
            <div className="regisztracio-redirect-text">
              Átirányítás a bejelentkezéshez <span>{countdown}</span> másodperc múlva...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Regisztracio;