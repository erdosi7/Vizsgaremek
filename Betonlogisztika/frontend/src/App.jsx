import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Home';
import Ajanlatkeres from './Ajanlatkeres';
import Megrendeles from './Megrendeles';
import Impresszum from './Impresszum';
import AdatvedelmiNyil from './AdatvedelmiNyil';
import AltSzerFelt from './AltSzerFelt';
import Kapcsolat from './Kapcsolat';
import Partnereink from './Partnereink';
import Regisztracio from './Regisztracio';
import Ajanlataim from './Ajanlataim';
import Megrendeleim from './Megrendeleim';
import './App.css';
import AdminDashboard from './AdminDashboard';


// Login komponens
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3); 
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      onLoginSuccess();
      navigate('/');
    }
  }, [isSuccess, countdown, navigate, onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validáció
    let newErrors = { email: '', password: '' };
    let isValid = true;
    
    if (!email.trim()) { 
      newErrors.email = 'Kérjük, adja meg az email címét!'; 
      isValid = false; 
    } else if (!isValidEmail(email)) { 
      newErrors.email = 'Kérjük, adjon meg egy érvényes email címet!'; 
      isValid = false; 
    }
    
    if (!password.trim()) { 
      newErrors.password = 'Kérjük, adja meg a jelszavát!'; 
      isValid = false; 
    }
    
    setErrors(newErrors);
    setServerError('');
    
    if (!isValid) return;
    
    // Backend hívás
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, jelszo: password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Token mentése
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsSuccess(true);
      } else {
        setServerError(data.message || 'Hibás email vagy jelszó!');
      }
    } catch (error) {
      console.error('Bejelentkezési hiba:', error);
      setServerError('Hálózati hiba. Kérjük, próbálja újra később!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="logo-container">
            <div className="logo"></div>
            <h1>BetonLogisztika</h1>
          </div>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Email cím:</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="pelda@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <div className="error-message visible">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label>Jelszó:</label>
              <div className="password-wrapper">
                <div className="input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && <div className="error-message visible">{errors.password}</div>}
            </div>

            {/* Szerver hibaüzenet */}
            {serverError && (
              <div className="error-message visible" style={{ textAlign: 'center', marginBottom: '10px' }}>
                {serverError}
              </div>
            )}

            <button type="submit" className="btn-signin" disabled={isLoading}>
              {isLoading ? 'BEJELENTKEZÉS...' : 'BEJELENTKEZÉS'}
            </button>
          </form>

          <div className="register-section">
            <p>Még nincs fiókod?</p>
            <a href="#" className="btn-register" onClick={(e) => { e.preventDefault(); navigate('/regisztracio'); }}>Regisztráció</a>
          </div>
        </div>
      </div>

      {isSuccess && (
        <div className="success-overlay" style={{ display: 'flex' }}>
          <div className="success-content">
            <div className="checkmark-circle">
              <i className="fas fa-check"></i>
            </div>
            <h2>Sikeres bejelentkezés!</h2>
            <p>Üdv újra a BetonLogisztika családban!</p>
            <div className="loader"></div>
            <div className="redirect-text">
              Átirányítás a főoldalra <span>{countdown}</span> másodperc múlva...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fő App komponens
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Ellenőrizzük, hogy van-e token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // A token már el van mentve a LoginPage-ben
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn'); // Régi kulcs törlése
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* ✅ NYILVÁNOS OLDALAK - bejelentkezés NÉLKÜL is elérhetők */}
        <Route path="/regisztracio" element={<Regisztracio />} />
        <Route path="/impresszum" element={<Impresszum />} />
        <Route path="/adatvedelmi_nyil" element={<AdatvedelmiNyil />} />
        <Route path="/alt_szer_felt" element={<AltSzerFelt />} />
        
        {/* 🔐 BEJELENTKEZÉS KÖTELEZŐ oldalak - CSAK isLoggedIn esetén */}
        <Route 
          path="/" 
          element={
            isLoggedIn ? 
              <Home onLogout={handleLogout} /> : 
              <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/ajanlatkeres" 
          element={
            isLoggedIn ? 
              <Ajanlatkeres onLogout={handleLogout} /> : 
              <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/megrendeles" 
          element={
            isLoggedIn ? 
              <Megrendeles onLogout={handleLogout} /> : 
              <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/kapcsolat" 
          element={
            isLoggedIn ? 
              <Kapcsolat onLogout={handleLogout} /> : 
              <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/partnereink" 
          element={
            isLoggedIn ? 
              <Partnereink onLogout={handleLogout} /> : 
              <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/ajanlataim" 
          element={
            isLoggedIn ? 
              <Ajanlataim onLogout={handleLogout} /> : 
              <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/megrendeleim" 
          element={
            isLoggedIn ? 
              <Megrendeleim onLogout={handleLogout} /> : 
              <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;