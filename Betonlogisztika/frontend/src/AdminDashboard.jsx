import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [activeTab, setActiveTab] = useState('ajanlatok');
  const [ajanlatok, setAjanlatok] = useState([]);
  const [megrendelesek, setMegrendelesek] = useState([]);
  const [felhasznalok, setFelhasznalok] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  const [ajanlatFilter, setAjanlatFilter] = useState('all');
  const [megrendelesFilter, setMegrendelesFilter] = useState('all');
  const [ajanlatSearch, setAjanlatSearch] = useState('');
  const [megrendelesSearch, setMegrendelesSearch] = useState('');
  const [felhasznaloSearch, setFelhasznaloSearch] = useState('');

  const [partnerek, setPartnerek] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [showDeletePartnerModal, setShowDeletePartnerModal] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState('');

  const [newPartnerData, setNewPartnerData] = useState({
    nev: '',
    telephely_nev: '',
    latitud: '',
    longitud: '',
    napi_kapacitas: '',
    website: '',
    telefon: ''
  });

  const [editPartnerData, setEditPartnerData] = useState({
    nev: '',
    telephely_nev: '',
    latitud: '',
    longitud: '',
    napi_kapacitas: '',
    website: '',
    telefon: ''
  });

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAjanlatModal, setShowDeleteAjanlatModal] = useState(false);
  const [showDeleteMegrendelesModal, setShowDeleteMegrendelesModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [ajanlatToDelete, setAjanlatToDelete] = useState(null);
  const [megrendelesToDelete, setMegrendelesToDelete] = useState(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nev: '',
    email: '',
    jelszo: '',
    cegnev: '',
    telefon: '',
    jogosultsag: 'user'
  });
  const [editFormData, setEditFormData] = useState({
    nev: '',
    email: '',
    cegnev: '',
    telefon: '',
    jogosultsag: ''
  });

  const goToHome = () => {
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && accountToggleRef.current) {
        if (!dropdownRef.current.contains(e.target) && e.target !== accountToggleRef.current && !accountToggleRef.current.contains(e.target)) {
          setIsAccountDropdownActive(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
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
      
      if (payload.jogosultsag !== 'admin') {
        navigate('/');
      }
    } catch (e) {
      console.log('Token dekódolási hiba:', e);
    }
  }, [navigate]);

  useEffect(() => {
    if (user?.jogosultsag === 'admin') {
      loadAjanlatok();
      loadMegrendelesek();
      loadFelhasznalok();
      loadPartnerek();
    }
  }, [user]);

  const loadAjanlatok = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/admin/ajanlatok', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAjanlatok(data.ajanlatok);
    } catch (error) {
      console.error('Hiba:', error);
      setError('Hiba történt az ajánlatok betöltésekor');
    }
  };

  const loadMegrendelesek = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/admin/megrendelesek', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setMegrendelesek(data.megrendelesek);
    } catch (error) {
      console.error('Hiba:', error);
      setError('Hiba történt a megrendelések betöltésekor');
    }
  };

  const loadFelhasznalok = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/admin/felhasznalok', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFelhasznalok(data.felhasznalok);
      }
    } catch (error) {
      console.error('Hiba:', error);
      setError('Hiba történt a felhasználók betöltésekor');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPartnerek = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/admin/partnerek', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPartnerek(data.partnerek);
      }
    } catch (error) {
      console.error('Hiba a partnerek betöltésekor:', error);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      nev: user.nev,
      email: user.email,
      cegnev: user.cegnev || '',
      telefon: user.telefon,
      jogosultsag: user.jogosultsag
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/felhasznalok/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      if (data.success) {
        loadFelhasznalok();
        setShowEditModal(false);
        setEditingUser(null);
        alert('✅ Felhasználó adatai frissítve!');
      } else {
        alert(data.message || 'Hiba történt!');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleDeleteClick = (selectedUser) => {
    if (selectedUser.id === user?.id) {
      alert('Nem törölheted saját magad!');
      return;
    }
    setUserToDelete(selectedUser);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) {
      alert('Nincs kiválasztva felhasználó!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Nincs bejelentkezve!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/felhasznalok/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        await loadFelhasznalok();
        setShowDeleteModal(false);
        setUserToDelete(null);
        alert('✅ Felhasználó sikeresen törölve!');
      } else {
        alert(data.message || 'Hiba történt a törlés során!');
      }
    } catch (error) {
      console.error('❌ Hálózati hiba:', error);
      alert('Hálózati hiba! Ellenőrizd, hogy fut-e a backend szerver.');
    }
  };

  const handleDeleteAjanlatClick = (ajanlat) => {
    setAjanlatToDelete(ajanlat);
    setShowDeleteAjanlatModal(true);
  };

  const confirmDeleteAjanlat = async () => {
    if (!ajanlatToDelete) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/admin/ajanlatok/${ajanlatToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        loadAjanlatok();
        setShowDeleteAjanlatModal(false);
        setAjanlatToDelete(null);
        alert('✅ Ajánlat sikeresen törölve!');
      } else {
        alert(data.message || 'Hiba történt!');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleDeleteMegrendelesClick = (megrendeles) => {
    setMegrendelesToDelete(megrendeles);
    setShowDeleteMegrendelesModal(true);
  };

  const confirmDeleteMegrendeles = async () => {
    if (!megrendelesToDelete) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/admin/megrendelesek/${megrendelesToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        loadMegrendelesek();
        setShowDeleteMegrendelesModal(false);
        setMegrendelesToDelete(null);
        alert('✅ Megrendelés sikeresen törölve!');
      } else {
        alert(data.message || 'Hiba történt!');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/admin/felhasznalok', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserData)
      });

      const data = await response.json();
      if (data.success) {
        loadFelhasznalok();
        setShowNewUserModal(false);
        setNewUserData({
          nev: '',
          email: '',
          jelszo: '',
          cegnev: '',
          telefon: '',
          jogosultsag: 'user'
        });
        alert('✅ Új felhasználó létrehozva!');
      } else {
        alert(data.message || 'Hiba történt!');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleNewPartnerSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/admin/partnerek', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPartnerData)
      });

      const data = await response.json();
      if (data.success) {
        loadPartnerek();
        setShowPartnerModal(false);
        setNewPartnerData({
          nev: '',
          telephely_nev: '',
          latitud: '',
          longitud: '',
          napi_kapacitas: '',
          website: '',
          telefon: ''
        });
        alert('✅ Partner sikeresen létrehozva!');
      } else {
        alert(data.message || 'Hiba történt!');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleEditPartnerClick = (partner) => {
    setEditingPartner(partner);
    setEditPartnerData({
      nev: partner.nev,
      telephely_nev: partner.telephely_nev,
      latitud: partner.latitud || '',
      longitud: partner.longitud || '',
      napi_kapacitas: partner.napi_kapacitas,
      website: partner.website || '',
      telefon: partner.telefon || ''
    });
    setShowPartnerModal(true);
  };

  const handleEditPartnerSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:3000/api/admin/partnerek/${editingPartner.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editPartnerData)
      });

      const data = await response.json();
      if (data.success) {
        loadPartnerek();
        setShowPartnerModal(false);
        setEditingPartner(null);
        alert('✅ Partner adatai frissítve!');
      } else {
        alert(data.message || 'Hiba történt!');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleDeletePartnerClick = (partner) => {
    setPartnerToDelete(partner);
    setShowDeletePartnerModal(true);
  };

  const confirmDeletePartner = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/admin/partnerek/${partnerToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        loadPartnerek();
        setShowDeletePartnerModal(false);
        setPartnerToDelete(null);
        alert('✅ Partner sikeresen törölve!');
      } else {
        alert(data.message || 'Hiba történt!');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hálózati hiba!');
    }
  };

  const handleAjanlatStatusChange = async (ajanlatId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/admin/ajanlatok/${ajanlatId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statusz: newStatus })
      });
      
      const data = await response.json();
      if (data.success) loadAjanlatok();
    } catch (error) {
      console.error('Hiba:', error);
    }
  };

  const handleMegrendelesStatusChange = async (megrendelesId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/admin/megrendelesek/${megrendelesId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statusz: newStatus })
      });
      
      const data = await response.json();
      if (data.success) loadMegrendelesek();
    } catch (error) {
      console.error('Hiba:', error);
    }
  };

  const getFilteredAjanlatok = () => {
    let filtered = ajanlatok;
    if (ajanlatFilter !== 'all') filtered = filtered.filter(a => a.statusz === ajanlatFilter);
    if (ajanlatSearch.trim() !== '') {
      const searchLower = ajanlatSearch.toLowerCase();
      filtered = filtered.filter(a => 
        a.felhasznalo_nev?.toLowerCase().includes(searchLower) ||
        a.felhasznalo_email?.toLowerCase().includes(searchLower) ||
        a.ajanlatszam?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  };

  const getFilteredMegrendelesek = () => {
    let filtered = megrendelesek;
    if (megrendelesFilter !== 'all') filtered = filtered.filter(m => m.statusz === megrendelesFilter);
    if (megrendelesSearch.trim() !== '') {
      const searchLower = megrendelesSearch.toLowerCase();
      filtered = filtered.filter(m => 
        m.felhasznalo_nev?.toLowerCase().includes(searchLower) ||
        m.felhasznalo_email?.toLowerCase().includes(searchLower) ||
        m.megrendeles_szam?.toLowerCase().includes(searchLower) ||
        m.ajanlatszam?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  };

  const getFilteredFelhasznalok = () => {
    if (felhasznaloSearch.trim() === '') return felhasznalok;
    const searchLower = felhasznaloSearch.toLowerCase();
    return felhasznalok.filter(f => 
      f.nev?.toLowerCase().includes(searchLower) ||
      f.email?.toLowerCase().includes(searchLower) ||
      f.cegnev?.toLowerCase().includes(searchLower) ||
      f.telefon?.includes(searchLower)
    );
  };

  const getFilteredPartnerek = () => {
    if (partnerSearch.trim() === '') return partnerek;
    const searchLower = partnerSearch.toLowerCase();
    return partnerek.filter(p => 
      p.nev?.toLowerCase().includes(searchLower) ||
      p.telephely_nev?.toLowerCase().includes(searchLower)
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);
  };

  const getAjanlatStatusBadgeClass = (status) => {
    const map = {
      'függőben': 'pending',
      'elfogadva': 'accepted',
      'elutasítva': 'rejected',
      'lejárt': 'expired'
    };
    return map[status] || '';
  };

  const getMegrendelesStatusBadgeClass = (status) => {
    const map = {
      'feldolgozás alatt': 'processing',
      'szállítás alatt': 'shipping',
      'véglegesítve': 'completed',
      'sikertelen': 'failed'
    };
    return map[status] || '';
  };

  const stat = {
    ajanlat: {
      osszes: ajanlatok.length,
      fuggoben: ajanlatok.filter(a => a.statusz === 'függőben').length,
      elfogadva: ajanlatok.filter(a => a.statusz === 'elfogadva').length,
      elutasitva: ajanlatok.filter(a => a.statusz === 'elutasítva').length,
      lejart: ajanlatok.filter(a => a.statusz === 'lejárt').length
    },
    megrendeles: {
      osszes: megrendelesek.length,
      feldolgozas: megrendelesek.filter(m => m.statusz === 'feldolgozás alatt').length,
      szallitas: megrendelesek.filter(m => m.statusz === 'szállítás alatt').length,
      veglegesitve: megrendelesek.filter(m => m.statusz === 'véglegesítve').length,
      sikertelen: megrendelesek.filter(m => m.statusz === 'sikertelen').length
    }
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

  const handleNavLinkClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <>
      <header className="admin-main-header">
        <div className="admin-main-header-container">
          <a href="/" className="admin-main-logo" onClick={(e) => { e.preventDefault(); goToHome(); }}>
            <div className="admin-main-logo-icon"></div>
            <div className="admin-main-logo-text">BetonLogisztika</div>
          </a>
          <ul className="admin-main-nav-menu">
            <li className="admin-main-nav-item">
              <a href="/" className="admin-main-nav-link" onClick={(e) => { e.preventDefault(); goToHome(); }}>Kezdőoldal</a>
            </li>
            <li className="admin-main-nav-item">
              <a href="/megrendeles" className="admin-main-nav-link" onClick={(e) => { e.preventDefault(); navigate('/megrendeles'); }}>Megrendelés</a>
            </li>
            <li className="admin-main-nav-item">
              <a href="/ajanlatkeres" className="admin-main-nav-link" onClick={(e) => { e.preventDefault(); navigate('/ajanlatkeres'); }}>Ajánlatkérés</a>
            </li>
            <li className="admin-main-nav-item">
              <a href="/kapcsolat" className="admin-main-nav-link" onClick={(e) => { e.preventDefault(); navigate('/kapcsolat'); }}>Kapcsolat</a>
            </li>
            <li className="admin-main-nav-item">
              <a href="/partnereink" className="admin-main-nav-link" onClick={(e) => { e.preventDefault(); navigate('/partnereink'); }}>Partnereink</a>
            </li>
          </ul>
          
          <div className="admin-main-account-menu">
            <div className="admin-main-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
              <i className="fas fa-user"></i>
            </div>
            <div className={`admin-main-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
              <div className="admin-main-account-header">
                <h3>Fiókom</h3>
              </div>
              <div className="admin-main-account-content">
                <a href="/megrendeleim" className="admin-main-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
                  <i className="fas fa-box"></i> <span>Megrendeléseim</span>
                </a>
                <a href="/ajanlataim" className="admin-main-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
                  <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i> <span>Ajánlataim</span>
                </a>
                <a href="/admin" className="admin-main-account-menu-item active" onClick={(e) => handleNavLinkClick(e, '/admin')}>
                  <i className="fas fa-cog" style={{ color: '#f39c12' }}></i> <span>Admin felület</span>
                </a>
                <button className="admin-main-account-menu-item admin-main-logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>
              <i className="fas fa-crown" style={{ marginRight: '10px', color: '#f39c12' }}></i>
              Admin felület
            </h1>
            <p className="admin-welcome">Üdv újra, {user?.nev || 'Admin'}!</p>
          </div>
        </div>

        <div className="admin-stats-grid">
          {activeTab === 'ajanlatok' && (
            <>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4fc3f7' }}>
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Összes ajánlat</h3>
                  <p className="admin-stat-number">{stat.ajanlat.osszes}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#ff9800' }}>
                  <i className="fas fa-hourglass-half"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Függőben</h3>
                  <p className="admin-stat-number">{stat.ajanlat.fuggoben}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4caf50' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Elfogadva</h3>
                  <p className="admin-stat-number">{stat.ajanlat.elfogadva}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#e74c3c' }}>
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Elutasítva</h3>
                  <p className="admin-stat-number">{stat.ajanlat.elutasitva}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'megrendelesek' && (
            <>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4fc3f7' }}>
                  <i className="fas fa-box"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Összes megrendelés</h3>
                  <p className="admin-stat-number">{stat.megrendeles.osszes}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#ff9800' }}>
                  <i className="fas fa-hourglass-half"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Feldolgozás alatt</h3>
                  <p className="admin-stat-number">{stat.megrendeles.feldolgozas}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#2196f3' }}>
                  <i className="fas fa-truck"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Szállítás alatt</h3>
                  <p className="admin-stat-number">{stat.megrendeles.szallitas}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4caf50' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Véglegesítve</h3>
                  <p className="admin-stat-number">{stat.megrendeles.veglegesitve}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'felhasznalok' && (
            <>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4fc3f7' }}>
                  <i className="fas fa-users"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Összes felhasználó</h3>
                  <p className="admin-stat-number">{felhasznalok.length}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#f39c12' }}>
                  <i className="fas fa-crown"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Adminok</h3>
                  <p className="admin-stat-number">{felhasznalok.filter(f => f.jogosultsag === 'admin').length}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4caf50' }}>
                  <i className="fas fa-user"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Felhasználók</h3>
                  <p className="admin-stat-number">{felhasznalok.filter(f => f.jogosultsag === 'user').length}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#95a5a6' }}>
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Ma regisztrált</h3>
                  <p className="admin-stat-number">0</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'partnerek' && (
            <>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4fc3f7' }}>
                  <i className="fas fa-handshake"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Összes partner</h3>
                  <p className="admin-stat-number">{partnerek.length}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#f39c12' }}>
                  <i className="fas fa-globe"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Weboldalak</h3>
                  <p className="admin-stat-number">{partnerek.filter(p => p.website).length}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#4caf50' }}>
                  <i className="fas fa-phone"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Telefonszámok</h3>
                  <p className="admin-stat-number">{partnerek.filter(p => p.telefon).length}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: '#95a5a6' }}>
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <div className="admin-stat-content">
                  <h3>Össz kapacitás</h3>
                  <p className="admin-stat-number">{partnerek.reduce((sum, p) => sum + p.napi_kapacitas, 0)} m³</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'ajanlatok' ? 'active' : ''}`} onClick={() => setActiveTab('ajanlatok')}>
            <i className="fas fa-file-invoice"></i> Ajánlatok 
            <span className="admin-tab-badge">{stat.ajanlat.osszes}</span>
          </button>
          <button className={`admin-tab ${activeTab === 'megrendelesek' ? 'active' : ''}`} onClick={() => setActiveTab('megrendelesek')}>
            <i className="fas fa-box"></i> Megrendelések 
            <span className="admin-tab-badge">{stat.megrendeles.osszes}</span>
          </button>
          <button className={`admin-tab ${activeTab === 'felhasznalok' ? 'active' : ''}`} onClick={() => setActiveTab('felhasznalok')}>
            <i className="fas fa-users"></i> Felhasználók 
            <span className="admin-tab-badge">{felhasznalok.length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'partnerek' ? 'active' : ''}`}
            onClick={() => setActiveTab('partnerek')}
          >
            <i className="fas fa-handshake"></i> Partnerek 
            <span className="admin-tab-badge">{partnerek.length}</span>
          </button>
        </div>

        {activeTab === 'ajanlatok' && (
          <div className="admin-filter-row">
            <div className="admin-search-group">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Keresés név, email, ajánlatszám..." 
                value={ajanlatSearch} onChange={(e) => setAjanlatSearch(e.target.value)} className="admin-search-input" />
              {ajanlatSearch && <button className="admin-search-clear" onClick={() => setAjanlatSearch('')}><i className="fas fa-times"></i></button>}
            </div>
            <div className="admin-filter-group">
              <label>Szűrés:</label>
              <select value={ajanlatFilter} onChange={(e) => setAjanlatFilter(e.target.value)} className="admin-filter-select">
                <option value="all">Összes ({stat.ajanlat.osszes})</option>
                <option value="függőben">Függőben ({stat.ajanlat.fuggoben})</option>
                <option value="elfogadva">Elfogadva ({stat.ajanlat.elfogadva})</option>
                <option value="elutasítva">Elutasítva ({stat.ajanlat.elutasitva})</option>
                <option value="lejárt">Lejárt ({stat.ajanlat.lejart})</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'megrendelesek' && (
          <div className="admin-filter-row">
            <div className="admin-search-group">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Keresés név, email, rendelésszám..." 
                value={megrendelesSearch} onChange={(e) => setMegrendelesSearch(e.target.value)} className="admin-search-input" />
              {megrendelesSearch && <button className="admin-search-clear" onClick={() => setMegrendelesSearch('')}><i className="fas fa-times"></i></button>}
            </div>
            <div className="admin-filter-group">
              <label>Szűrés:</label>
              <select value={megrendelesFilter} onChange={(e) => setMegrendelesFilter(e.target.value)} className="admin-filter-select">
                <option value="all">Összes ({stat.megrendeles.osszes})</option>
                <option value="feldolgozás alatt">Feldolgozás alatt ({stat.megrendeles.feldolgozas})</option>
                <option value="szállítás alatt">Szállítás alatt ({stat.megrendeles.szallitas})</option>
                <option value="véglegesítve">Véglegesítve ({stat.megrendeles.veglegesitve})</option>
                <option value="sikertelen">Sikertelen ({stat.megrendeles.sikertelen})</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'felhasznalok' && (
          <div className="admin-filter-row">
            <div className="admin-search-group" style={{ flex: 3 }}>
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Keresés név, email, cég, telefon..." 
                value={felhasznaloSearch} onChange={(e) => setFelhasznaloSearch(e.target.value)} className="admin-search-input" />
              {felhasznaloSearch && <button className="admin-search-clear" onClick={() => setFelhasznaloSearch('')}><i className="fas fa-times"></i></button>}
            </div>
            
            <button className="admin-new-user-btn" onClick={() => setShowNewUserModal(true)}>
              <i className="fas fa-user-plus"></i> Új felhasználó
            </button>
          </div>
        )}

        {activeTab === 'partnerek' && (
          <div className="admin-filter-row">
            <div className="admin-search-group" style={{ flex: 3 }}>
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Keresés név, telephely, weboldal..." 
                value={partnerSearch} 
                onChange={(e) => setPartnerSearch(e.target.value)} 
                className="admin-search-input" 
              />
              {partnerSearch && (
                <button className="admin-search-clear" onClick={() => setPartnerSearch('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button className="admin-new-user-btn" onClick={() => {
              setEditingPartner(null);
              setNewPartnerData({
                nev: '',
                telephely_nev: '',
                latitud: '',
                longitud: '',
                napi_kapacitas: '',
                website: '',
                telefon: ''
              });
              setShowPartnerModal(true);
            }}>
              <i className="fas fa-plus-circle"></i> Új partner
            </button>
          </div>
        )}

        <div className="admin-content">
          {isLoading ? (
            <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Betöltés...</div>
          ) : error ? (
            <div className="admin-error">
              <i className="fas fa-exclamation-circle"></i> <p>{error}</p>
              <button onClick={() => { loadAjanlatok(); loadMegrendelesek(); loadFelhasznalok(); loadPartnerek(); }}>Újra</button>
            </div>
          ) : activeTab === 'ajanlatok' ? (
            <div className="admin-ajanlatok">
              {getFilteredAjanlatok().length > 0 ? getFilteredAjanlatok().map(ajanlat => (
                <div key={ajanlat.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3><i className="fas fa-file-invoice" style={{ marginRight: '8px', color: '#4fc3f7' }}></i>{ajanlat.ajanlatszam}</h3>
                      <p className="admin-user-info"><i className="fas fa-user"></i> {ajanlat.felhasznalo_nev} <span className="admin-user-email">({ajanlat.felhasznalo_email})</span></p>
                    </div>
                    <span className={`admin-status-badge ${getAjanlatStatusBadgeClass(ajanlat.statusz)}`}>{ajanlat.statusz}</span>
                  </div>
                  <div className="admin-card-body">
                    <div className="admin-card-row">
                      <span><i className="fas fa-building"></i> <strong>Betongyártó:</strong> {ajanlat.betongyarto_nev}</span>
                      <span><i className="fas fa-cube"></i> <strong>Beton típus:</strong> {ajanlat.beton_tipus_nev}</span>
                    </div>
                    <div className="admin-card-row">
                      <span><i className="fas fa-weight"></i> <strong>Mennyiség:</strong> {ajanlat.mennyiseg} m³</span>
                      <span><i className="fas fa-calendar"></i> <strong>Szállítás:</strong> {formatDate(ajanlat.szallitas_datum)}</span>
                    </div>
                    <div className="admin-card-row">
                      <span><i className="fas fa-money-bill"></i> <strong>Nettó:</strong> {formatPrice(ajanlat.netto_osszeg)}</span>
                      <span><i className="fas fa-money-bill-wave"></i> <strong>Bruttó:</strong> {formatPrice(ajanlat.brutto_osszeg)}</span>
                    </div>
                    <div className="admin-card-row admin-card-address">
                      <i className="fas fa-map-marker-alt"></i>
                      <span><strong>Cím:</strong> {ajanlat.iranyitoszam} {ajanlat.telepules}, {ajanlat.utca} {ajanlat.hazszam}</span>
                    </div>
                  </div>
                  <div className="admin-card-actions">
                    <label><i className="fas fa-edit"></i> Státusz módosítása:</label>
                    <div className="admin-select-wrapper">
                      <select value={ajanlat.statusz} onChange={(e) => handleAjanlatStatusChange(ajanlat.id, e.target.value)} className="admin-status-select">
                        <option value="függőben">⏳ Függőben</option>
                        <option value="elfogadva">✅ Elfogadva</option>
                        <option value="elutasítva">❌ Elutasítva</option>
                        <option value="lejárt">⌛ Lejárt</option>
                      </select>
                    </div>
                    <button 
                      className="admin-delete-btn"
                      onClick={() => handleDeleteAjanlatClick(ajanlat)}
                      title="Ajánlat törlése"
                    >
                      <i className="fas fa-trash"></i> Törlés
                    </button>
                  </div>
                </div>
              )) : (
                <div className="admin-empty">
                  <i className="fas fa-file-invoice" style={{ fontSize: '60px', color: '#ccc' }}></i>
                  <h3>Nincsenek megjeleníthető ajánlatok</h3>
                </div>
              )}
            </div>
          ) : activeTab === 'megrendelesek' ? (
            <div className="admin-megrendelesek">
              {getFilteredMegrendelesek().length > 0 ? getFilteredMegrendelesek().map(megrendeles => (
                <div key={megrendeles.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3><i className="fas fa-box" style={{ marginRight: '8px', color: '#4fc3f7' }}></i>{megrendeles.megrendeles_szam}</h3>
                      <p className="admin-user-info"><i className="fas fa-user"></i> {megrendeles.felhasznalo_nev} <span className="admin-user-email">({megrendeles.felhasznalo_email})</span></p>
                      <p className="admin-offer-ref"><i className="fas fa-file-invoice"></i> Ajánlat: {megrendeles.ajanlatszam}</p>
                    </div>
                    <span className={`admin-status-badge ${getMegrendelesStatusBadgeClass(megrendeles.statusz)}`}>{megrendeles.statusz}</span>
                  </div>
                  <div className="admin-card-body">
                    <div className="admin-card-row">
                      <span><i className="fas fa-building"></i> <strong>Betongyártó:</strong> {megrendeles.betongyarto_nev}</span>
                      <span><i className="fas fa-cube"></i> <strong>Beton típus:</strong> {megrendeles.beton_tipus_nev}</span>
                    </div>
                    <div className="admin-card-row">
                      <span><i className="fas fa-weight"></i> <strong>Mennyiség:</strong> {megrendeles.mennyiseg} m³</span>
                      <span><i className="fas fa-money-bill-wave"></i> <strong>Összeg:</strong> {formatPrice(megrendeles.brutto_osszeg)}</span>
                    </div>
                    <div className="admin-card-row">
                      <span><i className="fas fa-calendar-alt"></i> <strong>Megrendelve:</strong> {formatDate(megrendeles.letrehozas_datum)}</span>
                    </div>
                    <div className="admin-card-row admin-card-address">
                      <i className="fas fa-truck"></i>
                      <span><strong>Szállítási cím:</strong> {megrendeles.szallitas_iranyitoszam} {megrendeles.szallitas_telepules}, {megrendeles.szallitas_utca} {megrendeles.szallitas_hazszam}</span>
                    </div>
                  </div>
                  <div className="admin-card-actions">
                    <label><i className="fas fa-edit"></i> Státusz módosítása:</label>
                    <div className="admin-select-wrapper">
                      <select value={megrendeles.statusz} onChange={(e) => handleMegrendelesStatusChange(megrendeles.id, e.target.value)} className="admin-status-select">
                        <option value="feldolgozás alatt">⏳ Feldolgozás alatt</option>
                        <option value="szállítás alatt">🚚 Szállítás alatt</option>
                        <option value="véglegesítve">✅ Véglegesítve</option>
                        <option value="sikertelen">❌ Sikertelen</option>
                      </select>
                    </div>
                    <button 
                      className="admin-delete-btn"
                      onClick={() => handleDeleteMegrendelesClick(megrendeles)}
                      title="Megrendelés törlése"
                    >
                      <i className="fas fa-trash"></i> Törlés
                    </button>
                  </div>
                </div>
              )) : (
                <div className="admin-empty">
                  <i className="fas fa-box-open" style={{ fontSize: '60px', color: '#ccc' }}></i>
                  <h3>Nincsenek megjeleníthető megrendelések</h3>
                </div>
              )}
            </div>
          ) : activeTab === 'felhasznalok' ? (
            <div className="admin-felhasznalok">
              {getFilteredFelhasznalok().length > 0 ? (
                <div className="admin-users-grid">
                  {getFilteredFelhasznalok().map(felhasznalo => (
                    <div key={felhasznalo.id} className="admin-user-card">
                      <div className="admin-user-card-header" style={{ background: felhasznalo.jogosultsag === 'admin' ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 'linear-gradient(135deg, #2c3e50, #1a252f)' }}>
                        <div className="admin-user-avatar">
                          <i className="fas fa-user-circle"></i>
                        </div>
                        <div className="admin-user-title">
                          <h3>{felhasznalo.nev}</h3>
                          <span className={`admin-user-badge ${felhasznalo.jogosultsag === 'admin' ? 'admin' : 'user'}`}>
                            {felhasznalo.jogosultsag === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </div>
                      </div>
                      <div className="admin-user-card-body">
                        <p><i className="fas fa-envelope"></i> {felhasznalo.email}</p>
                        {felhasznalo.cegnev && <p><i className="fas fa-building"></i> {felhasznalo.cegnev}</p>}
                        <p><i className="fas fa-phone"></i> {felhasznalo.telefon}</p>
                        <p><i className="fas fa-calendar-alt"></i> Regisztráció: {formatDate(felhasznalo.regisztracio_datum)}</p>
                      </div>
                      <div className="admin-user-card-actions">
                        <button className="admin-user-btn admin-user-btn-edit" onClick={() => handleEditClick(felhasznalo)}>
                          <i className="fas fa-edit"></i> Szerkesztés
                        </button>
                        {felhasznalo.id !== user?.id && (
                          <button className="admin-user-btn admin-user-btn-delete" onClick={() => handleDeleteClick(felhasznalo)}>
                            <i className="fas fa-trash-alt"></i> Törlés
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty">
                  <i className="fas fa-users" style={{ fontSize: '60px', color: '#ccc' }}></i>
                  <h3>Nincsenek megjeleníthető felhasználók</h3>
                </div>
              )}
            </div>
          ) : activeTab === 'partnerek' ? (
            <div className="admin-partnerek">
              {getFilteredPartnerek().length > 0 ? (
                <div className="admin-partnerek-grid">
                  {getFilteredPartnerek().map(partner => (
                    <div key={partner.id} className="admin-partner-card">
                      <div className="admin-partner-card-header">
                        <div className="admin-partner-icon">
                          <i className="fas fa-building"></i>
                        </div>
                        <div className="admin-partner-title">
                          <h3>{partner.nev}</h3>
                          <p className="admin-partner-location">
                            <i className="fas fa-map-marker-alt"></i> {partner.telephely_nev}
                          </p>
                        </div>
                      </div>
                      
                      <div className="admin-partner-card-body">
                        <p>
                          <i className="fas fa-tachometer-alt"></i> 
                          <strong>Napi kapacitás:</strong> {partner.napi_kapacitas} m³
                        </p>
                        {partner.website && (
                          <p>
                            <i className="fas fa-globe"></i> 
                            <strong>Web:</strong> 
                            <a href={partner.website} target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', marginLeft: '5px' }}>
                              {partner.website.replace('https://', '').replace('http://', '')}
                            </a>
                          </p>
                        )}
                        {partner.telefon && (
                          <p>
                            <i className="fas fa-phone"></i> 
                            <strong>Tel:</strong> {partner.telefon}
                          </p>
                        )}
                        {partner.latitud && partner.longitud && (
                          <p>
                            <i className="fas fa-map-marker-alt"></i> 
                            <strong>Koordináták:</strong> {partner.latitud}, {partner.longitud}
                          </p>
                        )}
                      </div>

                      <div className="admin-partner-card-actions">
                        <button 
                          className="admin-partner-btn admin-partner-btn-edit"
                          onClick={() => handleEditPartnerClick(partner)}
                        >
                          <i className="fas fa-edit"></i> Szerkesztés
                        </button>
                        <button 
                          className="admin-partner-btn admin-partner-btn-delete"
                          onClick={() => handleDeletePartnerClick(partner)}
                        >
                          <i className="fas fa-trash-alt"></i> Törlés
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty">
                  <i className="fas fa-handshake" style={{ fontSize: '60px', color: '#ccc' }}></i>
                  <h3>Nincsenek partnerek</h3>
                  <p>Kattints az "Új partner" gombra a létrehozáshoz.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {showEditModal && editingUser && (
        <div className="admin-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fas fa-edit"></i> Felhasználó szerkesztése</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="admin-modal-form-group">
                <label>Név:</label>
                <input type="text" value={editFormData.nev} onChange={(e) => setEditFormData({...editFormData, nev: e.target.value})} required />
              </div>
              <div className="admin-modal-form-group">
                <label>Email:</label>
                <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} required />
              </div>
              <div className="admin-modal-form-group">
                <label>Cégnév:</label>
                <input type="text" value={editFormData.cegnev} onChange={(e) => setEditFormData({...editFormData, cegnev: e.target.value})} />
              </div>
              <div className="admin-modal-form-group">
                <label>Telefon:</label>
                <input type="text" value={editFormData.telefon} onChange={(e) => setEditFormData({...editFormData, telefon: e.target.value})} required />
              </div>
              <div className="admin-modal-form-group">
                <label>Jogosultság:</label>
                <select value={editFormData.jogosultsag} onChange={(e) => setEditFormData({...editFormData, jogosultsag: e.target.value})}>
                  <option value="user">User (normál felhasználó)</option>
                  <option value="admin">Admin (teljes hozzáférés)</option>
                </select>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-modal-btn admin-modal-btn-cancel" onClick={() => setShowEditModal(false)}>Mégsem</button>
                <button type="submit" className="admin-modal-btn admin-modal-btn-confirm">Mentés</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowNewUserModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fas fa-user-plus"></i> Új felhasználó</h2>
            <form onSubmit={handleNewUserSubmit}>
              <div className="admin-modal-form-group">
                <label>Név:</label>
                <input type="text" value={newUserData.nev} onChange={(e) => setNewUserData({...newUserData, nev: e.target.value})} required />
              </div>
              <div className="admin-modal-form-group">
                <label>Email:</label>
                <input type="email" value={newUserData.email} onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} required />
              </div>
              <div className="admin-modal-form-group">
                <label>Jelszó:</label>
                <input type="password" value={newUserData.jelszo} onChange={(e) => setNewUserData({...newUserData, jelszo: e.target.value})} required />
              </div>
              <div className="admin-modal-form-group">
                <label>Cégnév:</label>
                <input type="text" value={newUserData.cegnev} onChange={(e) => setNewUserData({...newUserData, cegnev: e.target.value})} />
              </div>
              <div className="admin-modal-form-group">
                <label>Telefon:</label>
                <input type="text" value={newUserData.telefon} onChange={(e) => setNewUserData({...newUserData, telefon: e.target.value})} required />
              </div>
              <div className="admin-modal-form-group">
                <label>Jogosultság:</label>
                <select value={newUserData.jogosultsag} onChange={(e) => setNewUserData({...newUserData, jogosultsag: e.target.value})}>
                  <option value="user">User (normál felhasználó)</option>
                  <option value="admin">Admin (teljes hozzáférés)</option>
                </select>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-modal-btn admin-modal-btn-cancel" onClick={() => setShowNewUserModal(false)}>Mégsem</button>
                <button type="submit" className="admin-modal-btn admin-modal-btn-confirm">Létrehozás</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && userToDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Felhasználó törlése</h2>
            <p>Biztosan törölni szeretnéd <strong>{userToDelete.nev}</strong> felhasználót?</p>
            <p className="admin-modal-warning">Ez a művelet nem visszavonható!</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn admin-modal-btn-cancel" onClick={() => setShowDeleteModal(false)}>Mégsem</button>
              <button className="admin-modal-btn admin-modal-btn-delete" onClick={confirmDelete}>Törlés</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAjanlatModal && ajanlatToDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteAjanlatModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Ajánlat törlése</h2>
            <p>Biztosan törölni szeretnéd ezt az ajánlatot?</p>
            <p className="admin-modal-order">{ajanlatToDelete.ajanlatszam} - {ajanlatToDelete.felhasznalo_nev}</p>
            <p className="admin-modal-warning">Ez a művelet nem visszavonható!</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn admin-modal-btn-cancel" onClick={() => setShowDeleteAjanlatModal(false)}>Mégsem</button>
              <button className="admin-modal-btn admin-modal-btn-delete" onClick={confirmDeleteAjanlat}>Törlés</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteMegrendelesModal && megrendelesToDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteMegrendelesModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Megrendelés törlése</h2>
            <p>Biztosan törölni szeretnéd ezt a megrendelést?</p>
            <p className="admin-modal-order">{megrendelesToDelete.megrendeles_szam} - {megrendelesToDelete.felhasznalo_nev}</p>
            <p className="admin-modal-warning">Ez a művelet nem visszavonható!</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn admin-modal-btn-cancel" onClick={() => setShowDeleteMegrendelesModal(false)}>Mégsem</button>
              <button className="admin-modal-btn admin-modal-btn-delete" onClick={confirmDeleteMegrendeles}>Törlés</button>
            </div>
          </div>
        </div>
      )}

      {showDeletePartnerModal && partnerToDelete && (
        <div className="admin-modal-overlay" onClick={() => setShowDeletePartnerModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Partner törlése</h2>
            <p>Biztosan törölni szeretnéd <strong>{partnerToDelete.nev} - {partnerToDelete.telephely_nev}</strong> partnert?</p>
            <p className="admin-modal-warning">Csak akkor törölhető, ha nincsenek árai és foglalásai!</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn admin-modal-btn-cancel" onClick={() => setShowDeletePartnerModal(false)}>
                Mégsem
              </button>
              <button className="admin-modal-btn admin-modal-btn-delete" onClick={confirmDeletePartner}>
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}

      {showPartnerModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPartnerModal(false)}>
          <div className="admin-modal-content admin-modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2>
              <i className={`fas ${editingPartner ? 'fa-edit' : 'fa-plus-circle'}`}></i>
              {editingPartner ? 'Partner szerkesztése' : 'Új partner'}
            </h2>
            <form onSubmit={editingPartner ? handleEditPartnerSubmit : handleNewPartnerSubmit}>
              <div className="admin-modal-form-group">
                <label>Cégnév:</label>
                <input 
                  type="text" 
                  value={editingPartner ? editPartnerData.nev : newPartnerData.nev}
                  onChange={(e) => {
                    if (editingPartner) {
                      setEditPartnerData({...editPartnerData, nev: e.target.value});
                    } else {
                      setNewPartnerData({...newPartnerData, nev: e.target.value});
                    }
                  }}
                  required
                />
              </div>
              <div className="admin-modal-form-group">
                <label>Telephely név:</label>
                <input 
                  type="text" 
                  value={editingPartner ? editPartnerData.telephely_nev : newPartnerData.telephely_nev}
                  onChange={(e) => {
                    if (editingPartner) {
                      setEditPartnerData({...editPartnerData, telephely_nev: e.target.value});
                    } else {
                      setNewPartnerData({...newPartnerData, telephely_nev: e.target.value});
                    }
                  }}
                  required
                />
              </div>
              <div className="admin-modal-form-group">
                <label>Napi kapacitás (m³):</label>
                <input 
                  type="number" 
                  value={editingPartner ? editPartnerData.napi_kapacitas : newPartnerData.napi_kapacitas}
                  onChange={(e) => {
                    if (editingPartner) {
                      setEditPartnerData({...editPartnerData, napi_kapacitas: e.target.value});
                    } else {
                      setNewPartnerData({...newPartnerData, napi_kapacitas: e.target.value});
                    }
                  }}
                  required
                />
              </div>
              <div className="admin-modal-form-row" style={{ display: 'flex', gap: '15px' }}>
                <div className="admin-modal-form-group" style={{ flex: 1 }}>
                  <label>Szélesség (latitud):</label>
                  <input 
                    type="text" 
                    value={editingPartner ? editPartnerData.latitud : newPartnerData.latitud}
                    onChange={(e) => {
                      if (editingPartner) {
                        setEditPartnerData({...editPartnerData, latitud: e.target.value});
                      } else {
                        setNewPartnerData({...newPartnerData, latitud: e.target.value});
                      }
                    }}
                    placeholder="pl. 46.771014"
                  />
                </div>
                <div className="admin-modal-form-group" style={{ flex: 1 }}>
                  <label>Hosszúság (longitud):</label>
                  <input 
                    type="text" 
                    value={editingPartner ? editPartnerData.longitud : newPartnerData.longitud}
                    onChange={(e) => {
                      if (editingPartner) {
                        setEditPartnerData({...editPartnerData, longitud: e.target.value});
                      } else {
                        setNewPartnerData({...newPartnerData, longitud: e.target.value});
                      }
                    }}
                    placeholder="pl. 17.242267"
                  />
                </div>
              </div>
              <div className="admin-modal-form-group">
                <label>Weboldal:</label>
                <input 
                  type="url" 
                  value={editingPartner ? editPartnerData.website : newPartnerData.website}
                  onChange={(e) => {
                    if (editingPartner) {
                      setEditPartnerData({...editPartnerData, website: e.target.value});
                    } else {
                      setNewPartnerData({...newPartnerData, website: e.target.value});
                    }
                  }}
                  placeholder="https://www.example.com"
                />
              </div>
              <div className="admin-modal-form-group">
                <label>Telefon:</label>
                <input 
                  type="text" 
                  value={editingPartner ? editPartnerData.telefon : newPartnerData.telefon}
                  onChange={(e) => {
                    if (editingPartner) {
                      setEditPartnerData({...editPartnerData, telefon: e.target.value});
                    } else {
                      setNewPartnerData({...newPartnerData, telefon: e.target.value});
                    }
                  }}
                  placeholder="+36 30 123 4567"
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-modal-btn admin-modal-btn-cancel" onClick={() => setShowPartnerModal(false)}>
                  Mégsem
                </button>
                <button type="submit" className="admin-modal-btn admin-modal-btn-confirm">
                  {editingPartner ? 'Mentés' : 'Létrehozás'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;