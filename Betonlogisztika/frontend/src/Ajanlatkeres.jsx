import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Ajanlatkeres.css';

const Ajanlatkeres = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isAccountDropdownActive, setIsAccountDropdownActive] = useState(false);
  const dropdownRef = useRef(null);
  const accountToggleRef = useRef(null);
  const [user, setUser] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const MAX_SZALLITASI_TAVOLSAG = 70;

  const telephely = {
    lat: 46.7657,
    lng: 17.2443,
    name: "Keszthely"
  };

  const betonCegLista = [
    {
      id: 1,
      name: "Readymix Zala Kft.",
      telephelyek: [
        { name: "Keszthely", coords: [46.7657, 17.2443] },
        { name: "Zalaegerszeg", coords: [46.8454, 16.8472] },
        { name: "Nagykanizsa", coords: [46.4552, 16.9953] }
      ],
      kapacitas: 80,
      betonArak: {
        'c8-10': 26000,
        'c12-15': 28000,
        'c16-20': 30000,
        'c20-25': 35000,
        'c25-30': 33000,
        'c30-37': 37000
      }
    },
    {
      id: 2,
      name: "Duna Dráva Cement Kft.",
      telephelyek: [
        { name: "Veszprém", coords: [47.1028, 17.9093] }
      ],
      kapacitas: 40,
      betonArak: {
        'c8-10': 25500,
        'c12-15': 27500,
        'c16-20': 29500,
        'c20-25': 34500,
        'c25-30': 32500,
        'c30-37': 36500
      }
    },
    {
      id: 3,
      name: "Danubiusbeton Dunántúl Kft.",
      telephelyek: [
        { name: "Siófok", coords: [46.9041, 18.0581] },
        { name: "Székesfehérvár", coords: [47.1860, 18.4221] }
      ],
      kapacitas: 70,
      betonArak: {
        'c8-10': 26200,
        'c12-15': 28200,
        'c16-20': 30200,
        'c20-25': 35200,
        'c25-30': 33200,
        'c30-37': 37200
      }
    },
    {
      id: 4,
      name: "Domino Kft.",
      telephelyek: [
        { name: "Balatonkeresztúr", coords: [46.6973, 17.3735] }
      ],
      kapacitas: 30,
      betonArak: {
        'c8-10': 25000,
        'c12-15': 27000,
        'c16-20': 29000,
        'c20-25': 34000,
        'c25-30': 32000,
        'c30-37': 36000
      }
    },
    {
      id: 5,
      name: "Molnár Beton Kft.",
      telephelyek: [
        { name: "Tapolca", coords: [46.8814, 17.4412] },
        { name: "Aszófő", coords: [46.9333, 17.8333] }
      ],
      kapacitas: 60,
      betonArak: {
        'c8-10': 25700,
        'c12-15': 27700,
        'c16-20': 29700,
        'c20-25': 34700,
        'c25-30': 32700,
        'c30-37': 36700
      }
    },
    {
      id: 6,
      name: "TBG Balatonboglár Kft.",
      telephelyek: [
        { name: "Balatonboglár", coords: [46.7758, 17.6441] }
      ],
      kapacitas: 35,
      betonArak: {
        'c8-10': 25800,
        'c12-15': 27800,
        'c16-20': 29800,
        'c20-25': 34800,
        'c25-30': 32800,
        'c30-37': 36800
      }
    },
    {
      id: 7,
      name: "Invep Kft.",
      telephelyek: [
        { name: "Ajka", coords: [47.1020, 17.5520] }
      ],
      kapacitas: 30,
      betonArak: {
        'c8-10': 25300,
        'c12-15': 27300,
        'c16-20': 29300,
        'c20-25': 34300,
        'c25-30': 32300,
        'c30-37': 36300
      }
    },
    {
      id: 8,
      name: "CRH Magyarország Kft.",
      telephelyek: [
        { name: "Nagykanizsa", coords: [46.4552, 16.9953] },
        { name: "Zalaegerszeg", coords: [46.8454, 16.8472] },
        { name: "Körmend", coords: [47.0106, 16.6050] }
      ],
      kapacitas: 90,
      betonArak: {
        'c8-10': 26500,
        'c12-15': 28500,
        'c16-20': 30500,
        'c20-25': 35500,
        'c25-30': 33500,
        'c30-37': 37500
      }
    },
    {
      id: 9,
      name: "Frissbeton Kft.",
      telephelyek: [
        { name: "Veszprém", coords: [47.1028, 17.9093] }
      ],
      kapacitas: 35,
      betonArak: {
        'c8-10': 25400,
        'c12-15': 27400,
        'c16-20': 29400,
        'c20-25': 34400,
        'c25-30': 32400,
        'c30-37': 36400
      }
    }
  ];

  const betonszalArak = {
    'acel': 65000,
    'muanyag': 55000,
    'uveg': 59000,
    'nem': 0
  };

  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const calculateShippingCost = (distance, quantity) => {
    if (distance <= 10) {
      return 4000 * quantity;
    } else {
      const extraDistance = distance - 10;
      const extraBlocks = Math.ceil(extraDistance / 5);
      const extraCost = extraBlocks * 700 * quantity;
      return (4000 * quantity) + extraCost;
    }
  };

  const [formData, setFormData] = useState({
    postalCode: '',
    city: '',
    street: '',
    houseNumber: '',
    selectedCompany: '',
    concreteType: '',
    quantity: '',
    deliveryDate: '',
    pumpNeeded: '',
    concreteType2: '',
    message: '',
    terms: false,
    privacy: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isModalActive, setIsModalActive] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [customerCoords, setCustomerCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distanceError, setDistanceError] = useState('');
  const [offerDetails, setOfferDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const modalRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Hiba a koordináták lekérésekor:', error);
      return null;
    }
  };

  const findNearestOffice = (company, customerLat, customerLng) => {
    let nearestDist = Infinity;
    let nearestOffice = null;

    company.telephelyek.forEach(office => {
      const dist = calculateDistance(
        customerLat, customerLng,
        office.coords[0], office.coords[1]
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestOffice = office;
      }
    });

    return {
      office: nearestOffice,
      distance: nearestDist
    };
  };

  const calculateTotalPrice = () => {
    if (!formData.concreteType || !formData.quantity || !formData.selectedCompany) {
      return null;
    }

    const company = betonCegLista.find(c => c.id === parseInt(formData.selectedCompany));
    if (!company) return null;

    const quantity = parseFloat(formData.quantity) || 0;
    const betonAr = company.betonArak[formData.concreteType] || 0;
    const betonKoltseg = betonAr * quantity;
    const pumpaKoltseg = formData.pumpNeeded === 'igen' ? 50000 : 0;
    const betonszalKoltseg = betonszalArak[formData.concreteType2] || 0;
    
    let szallitasKoltseg = 0;
    if (distance) {
      szallitasKoltseg = calculateShippingCost(distance, quantity);
    }

    const nettoOsszeg = betonKoltseg + pumpaKoltseg + betonszalKoltseg + szallitasKoltseg;
    const afaOsszeg = Math.round(nettoOsszeg * 0.27);
    const bruttoOsszeg = nettoOsszeg + afaOsszeg;

    return {
      companyName: company.name,
      betonAr,
      betonKoltseg,
      pumpaKoltseg,
      betonszalKoltseg,
      szallitasKoltseg,
      nettoOsszeg,
      afaOsszeg,
      bruttoOsszeg
    };
  };

  const updateDistance = async () => {
    if (formData.postalCode && formData.city && formData.street && formData.houseNumber) {
      const fullAddress = `${formData.postalCode} ${formData.city}, ${formData.street} ${formData.houseNumber}`;
      const coords = await getCoordinates(fullAddress);
      
      if (coords) {
        setCustomerCoords(coords);
        
        const distanceFromBase = calculateDistance(
          telephely.lat, telephely.lng,
          coords.lat, coords.lng
        );
        
        setDistance(distanceFromBase);
        
        if (distanceFromBase > MAX_SZALLITASI_TAVOLSAG) {
          setDistanceError(`Sajnáljuk, de csak ${MAX_SZALLITASI_TAVOLSAG} km-es körzetben szállítunk. Az Ön által megadott cím kb. ${Math.round(distanceFromBase)} km-re van a keszthelyi telephelytől.`);
        } else {
          setDistanceError('');
        }
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateDistance();
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.postalCode, formData.city, formData.street, formData.houseNumber]);

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
    if (formData.selectedCompany && formData.concreteType && formData.quantity && distance && !distanceError) {
      const price = calculateTotalPrice();
      setCalculatedPrice(price);
    } else {
      setCalculatedPrice(null);
    }
  }, [
    formData.selectedCompany, 
    formData.concreteType, 
    formData.quantity, 
    formData.pumpNeeded, 
    formData.concreteType2, 
    distance,
    distanceError
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.querySelector('.ajanlatkeres-header');
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
    onLogout();
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === 'deliveryDate' && value) {
      if (isWeekend(value)) {
        setFormErrors({
          ...formErrors,
          deliveryDate: 'Hétvégén nem vállalunk szállítást! Kérjük, válasszon hétköznapot!'
        });
        setFormData({
          ...formData,
          [id]: ''
        });
        return;
      }
    }
    
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

  const getConcreteTypeText = (type) => {
    const types = {
      'c8-10': 'C8/10 - Tömörbeton',
      'c12-15': 'C12/15 - Alapbeton',
      'c16-20': 'C16/20 - Szerkezeti beton',
      'c20-25': 'C20/25 - Magas szilárdságú beton',
      'c25-30': 'C25/30 - Vasbeton',
      'c30-37': 'C30/37 - Nagy szilárdságú beton'
    };
    return types[type] || type;
  };

  const getBetonszalText = (type) => {
    const types = {
      'acel': 'Acélszálas',
      'muanyag': 'Műanyag szálas',
      'uveg': 'Üvegszálas',
      'nem': 'Nem szükséges'
    };
    return types[type] || type;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    let isValid = true;

    if (!formData.postalCode.trim()) {
      errors.postalCode = 'Kérjük, adja meg az irányítószámot!';
      isValid = false;
    }
    if (!formData.city.trim()) {
      errors.city = 'Kérjük, adja meg a települést!';
      isValid = false;
    }
    if (!formData.street.trim()) {
      errors.street = 'Kérjük, adja meg az utcát!';
      isValid = false;
    }
    if (!formData.houseNumber.trim()) {
      errors.houseNumber = 'Kérjük, adja meg a házszámot!';
      isValid = false;
    }

    if (distanceError) {
      errors.distance = distanceError;
      isValid = false;
    }

    if (!formData.concreteType) {
      errors.concreteType = 'Kérjük, válassza ki a beton típusát!';
      isValid = false;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'Kérjük, adja meg a beton mennyiségét!';
      isValid = false;
    }

    if (!formData.deliveryDate) {
      errors.deliveryDate = 'Kérjük, adja meg a tervezett szállítási időt!';
      isValid = false;
    } else if (formData.deliveryDate < today) {
      errors.deliveryDate = 'Csak jövőbeli dátum választható!';
      isValid = false;
    } else if (isWeekend(formData.deliveryDate)) {
      errors.deliveryDate = 'Hétvégén nem vállalunk szállítást!';
      isValid = false;
    }

    if (!formData.pumpNeeded) {
      errors.pumpNeeded = 'Kérjük, válasszon!';
      isValid = false;
    }

    if (!formData.concreteType2) {
      errors.concreteType2 = 'Kérjük, válassza ki a betonszál típusát!';
      isValid = false;
    }

    if (!formData.selectedCompany) {
      errors.selectedCompany = 'Kérjük, válasszon betongyártó céget!';
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

    setIsLoading(true);
    setServerError('');

    try {
      const betonTipusMap = {
        'c8-10': 1,
        'c12-15': 2,
        'c16-20': 3,
        'c20-25': 4,
        'c25-30': 5,
        'c30-37': 6
      };

      const betonszalMap = {
        'acel': 1,
        'muanyag': 2,
        'uveg': 3,
        'nem': 4
      };

      const token = localStorage.getItem('token');
      
      if (!token) {
        setServerError('Nincs bejelentkezve!');
        setIsLoading(false);
        return;
      }

      const requestBody = {
        beton_tipus_id: betonTipusMap[formData.concreteType],
        betonszal_tipus_id: formData.concreteType2 === 'nem' ? 4 : betonszalMap[formData.concreteType2],
        betongyarto_id: parseInt(formData.selectedCompany),
        mennyiseg: parseFloat(formData.quantity),
        pumpa_szukseges: formData.pumpNeeded === 'igen',
        szallitas_datum: formData.deliveryDate,
        iranyitoszam: formData.postalCode,
        telepules: formData.city,
        utca: formData.street,
        hazszam: formData.houseNumber,
        latitude: customerCoords?.lat || null,
        longitude: customerCoords?.lng || null,
        tavolsag_keszthelytol: distance || 0
      };

      console.log('📤 Küldött adatok:', requestBody);

      const response = await fetch('http://localhost:3000/api/ajanlatok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('📥 Szerver válasz:', data);

      if (data.success) {
        setOfferDetails({
          number: data.ajanlat.ajanlatszam,
          company: betonCegLista.find(c => c.id === parseInt(formData.selectedCompany))?.name,
          nearestOffice: 'Kiválasztott telephely',
          nettoPriceFormatted: formatPrice(data.ajanlat.nettoOsszeg),
          bruttoPriceFormatted: formatPrice(data.ajanlat.bruttoOsszeg)
        });
        setIsModalActive(true);

        setFormData({
          postalCode: '',
          city: '',
          street: '',
          houseNumber: '',
          selectedCompany: '',
          concreteType: '',
          quantity: '',
          deliveryDate: '',
          pumpNeeded: '',
          concreteType2: '',
          message: '',
          terms: false,
          privacy: false
        });
        setCalculatedPrice(null);
        setCustomerCoords(null);
        setDistance(null);
        setDistanceError('');
      } else {
        setServerError(data.message || 'Hiba történt az ajánlat mentése során!');
      }
    } catch (error) {
      console.error('❌ Hálózati hiba:', error);
      setServerError('Hálózati hiba: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalActive(false);
    setOfferDetails(null);
  };

  const handleModalClick = (e) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  return (
    <>
      <header className="ajanlatkeres-header">
        <div className="ajanlatkeres-header-container">
          <a href="/" className="ajanlatkeres-logo" onClick={(e) => handleNavLinkClick(e, '/')}>
            <div className="ajanlatkeres-logo-icon"></div>
            <div className="ajanlatkeres-logo-text">BetonLogisztika</div>
          </a>
          <ul className="ajanlatkeres-nav-menu">
            <li className="ajanlatkeres-nav-item">
              <a href="/" className="ajanlatkeres-nav-link" onClick={(e) => handleNavLinkClick(e, '/')}>Kezdőoldal</a>
            </li>
            <li className="ajanlatkeres-nav-item">
              <a href="/megrendeles" className="ajanlatkeres-nav-link" onClick={(e) => handleNavLinkClick(e, '/megrendeles')}>Megrendelés</a>
            </li>
            <li className="ajanlatkeres-nav-item">
              <a href="/ajanlatkeres" className="ajanlatkeres-nav-link active" onClick={(e) => handleNavLinkClick(e, '/ajanlatkeres')}>Ajánlatkérés</a>
            </li>
            <li className="ajanlatkeres-nav-item">
              <a href="/kapcsolat" className="ajanlatkeres-nav-link" onClick={(e) => handleNavLinkClick(e, '/kapcsolat')}>Kapcsolat</a>
            </li>
            <li className="ajanlatkeres-nav-item">
              <a href="/partnereink" className="ajanlatkeres-nav-link" onClick={(e) => handleNavLinkClick(e, '/partnereink')}>Partnereink</a>
            </li>
          </ul>

<div className="ajanlatkeres-account-menu">
  <div className="ajanlatkeres-account-toggle" ref={accountToggleRef} onClick={toggleDropdown}>
    <i className="fas fa-user"></i>
  </div>
  <div className={`ajanlatkeres-account-dropdown ${isAccountDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
    <div className="ajanlatkeres-account-header">
      <h3>Fiókom</h3>
    </div>
    <div className="ajanlatkeres-account-content">

      <a href="/megrendeleim" className="ajanlatkeres-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/megrendeleim')}>
        <i className="fas fa-box"></i>
        <span>Megrendeléseim</span>
      </a>

      <a href="/ajanlataim" className="ajanlatkeres-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/ajanlataim')}>
        <i className="fas fa-file-invoice" style={{ color: '#4CAF50' }}></i>
        <span>Ajánlataim</span>
      </a>

      {user?.jogosultsag === 'admin' && (
        <a href="/admin" className="ajanlatkeres-account-menu-item" onClick={(e) => handleNavLinkClick(e, '/admin')}>
          <i className="fas fa-cog" style={{ color: '#f39c12' }}></i>
          <span>Admin Dashboard</span>
        </a>
      )}

      <button className="ajanlatkeres-account-menu-item ajanlatkeres-logout-item" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Kijelentkezés</span>
      </button>
    </div>
  </div>
</div>
        </div>
      </header>

      <section className="ajanlatkeres-hero">
        <div className="ajanlatkeres-hero-content">
          <h1>Ingyenes ajánlatkérés</h1>
          <p>Töltse ki az alábbi űrlapot, és 24 órán belül kapcsolatba lépünk Önnel részletes árajánlattal!</p>
        </div>
      </section>

      <section className="ajanlatkeres-quote-section">
        <h2 className="ajanlatkeres-section-title">Ajánlatkérés</h2>
        <div className="ajanlatkeres-quote-container">
          <form onSubmit={handleSubmit} noValidate>
            <div className="ajanlatkeres-quote-form">
              <h3 className="ajanlatkeres-section-subtitle">Építkezés helyszíne</h3>
              
              <div className="ajanlatkeres-form-row">
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="postalCode">Irányítószám: <span className="ajanlatkeres-required-badge">*</span></label>
                  <input 
                    type="text" 
                    id="postalCode" 
                    className={`ajanlatkeres-form-control ${formErrors.postalCode ? 'error' : ''}`} 
                    placeholder="Pl.: 8360" 
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={`ajanlatkeres-error-message ${formErrors.postalCode ? 'visible' : ''}`}>{formErrors.postalCode}</div>
                </div>
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="city">Település: <span className="ajanlatkeres-required-badge">*</span></label>
                  <input 
                    type="text" 
                    id="city" 
                    className={`ajanlatkeres-form-control ${formErrors.city ? 'error' : ''}`} 
                    placeholder="Pl.: Keszthely" 
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={`ajanlatkeres-error-message ${formErrors.city ? 'visible' : ''}`}>{formErrors.city}</div>
                </div>
              </div>
              
              <div className="ajanlatkeres-form-row">
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="street">Utca: <span className="ajanlatkeres-required-badge">*</span></label>
                  <input 
                    type="text" 
                    id="street" 
                    className={`ajanlatkeres-form-control ${formErrors.street ? 'error' : ''}`} 
                    placeholder="Pl.: Pajta alja út" 
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={`ajanlatkeres-error-message ${formErrors.street ? 'visible' : ''}`}>{formErrors.street}</div>
                </div>
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="houseNumber">Házszám: <span className="ajanlatkeres-required-badge">*</span></label>
                  <input 
                    type="text" 
                    id="houseNumber" 
                    className={`ajanlatkeres-form-control ${formErrors.houseNumber ? 'error' : ''}`} 
                    placeholder="Pl.: 10" 
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={`ajanlatkeres-error-message ${formErrors.houseNumber ? 'visible' : ''}`}>{formErrors.houseNumber}</div>
                </div>
              </div>

              {distanceError && (
                <div className="ajanlatkeres-error-message visible" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', borderLeft: '4px solid #e74c3c' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px' }}></i> {distanceError}
                </div>
              )}

              <h3 className="ajanlatkeres-section-subtitle">Beton adatok</h3>
              
              <div className="ajanlatkeres-form-row ajanlatkeres-three-col">
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="concreteType">Beton típusa: <span className="ajanlatkeres-required-badge">*</span></label>
                  <select 
                    id="concreteType" 
                    className={`ajanlatkeres-form-control ${formErrors.concreteType ? 'error' : ''}`} 
                    value={formData.concreteType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Válasszon betontípust</option>
                    <option value="c8-10">C8/10 - Tömörbeton</option>
                    <option value="c12-15">C12/15 - Alapbeton</option>
                    <option value="c16-20">C16/20 - Szerkezeti beton</option>
                    <option value="c20-25">C20/25 - Magas szilárdságú beton</option>
                    <option value="c25-30">C25/30 - Vasbeton</option>
                    <option value="c30-37">C30/37 - Nagy szilárdságú beton</option>
                  </select>
                  <div className={`ajanlatkeres-error-message ${formErrors.concreteType ? 'visible' : ''}`}>{formErrors.concreteType}</div>
                </div>
                
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="quantity">Beton mennyisége (m³): <span className="ajanlatkeres-required-badge">*</span></label>
                  <input 
                    type="number" 
                    id="quantity" 
                    className={`ajanlatkeres-form-control ${formErrors.quantity ? 'error' : ''}`} 
                    min="0.5" 
                    step="0.5" 
                    placeholder="Pl.: 12.5" 
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={`ajanlatkeres-error-message ${formErrors.quantity ? 'visible' : ''}`}>{formErrors.quantity}</div>
                </div>
                
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="deliveryDate">Szállítási idő: <span className="ajanlatkeres-required-badge">*</span></label>
                  <input 
                    type="date" 
                    id="deliveryDate" 
                    className={`ajanlatkeres-form-control ${formErrors.deliveryDate ? 'error' : ''}`} 
                    min={today}
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={`ajanlatkeres-error-message ${formErrors.deliveryDate ? 'visible' : ''}`}>{formErrors.deliveryDate}</div>
                </div>
              </div>

              <h3 className="ajanlatkeres-section-subtitle">Betongyártó cég kiválasztása</h3>
              <div className="ajanlatkeres-form-group">
                <label htmlFor="selectedCompany">Válasszon betongyártó céget: <span className="ajanlatkeres-required-badge">*</span></label>
                <select 
                  id="selectedCompany" 
                  className={`ajanlatkeres-form-control ${formErrors.selectedCompany ? 'error' : ''}`} 
                  value={formData.selectedCompany}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Válasszon céget</option>
                  {betonCegLista.map(company => (
                    company.telephelyek.map((telephely, index) => (
                      <option key={`${company.id}-${index}`} value={company.id}>
                        {company.name} - {telephely.name}
                      </option>
                    ))
                  ))}
                </select>
                <div className={`ajanlatkeres-error-message ${formErrors.selectedCompany ? 'visible' : ''}`}>{formErrors.selectedCompany}</div>
              </div>

              <div className="ajanlatkeres-form-row ajanlatkeres-three-col">
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="pumpNeeded">Betonpumpa szükséges? <span className="ajanlatkeres-required-badge">*</span></label>
                  <select 
                    id="pumpNeeded" 
                    className={`ajanlatkeres-form-control ${formErrors.pumpNeeded ? 'error' : ''}`} 
                    value={formData.pumpNeeded}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Válasszon</option>
                    <option value="igen">Igen (+50.000 Ft)</option>
                    <option value="nem">Nem</option>
                  </select>
                  <div className={`ajanlatkeres-error-message ${formErrors.pumpNeeded ? 'visible' : ''}`}>{formErrors.pumpNeeded}</div>
                </div>
                
                <div className="ajanlatkeres-form-group">
                  <label htmlFor="concreteType2">Betonszálak: <span className="ajanlatkeres-required-badge">*</span></label>
                  <select 
                    id="concreteType2" 
                    className={`ajanlatkeres-form-control ${formErrors.concreteType2 ? 'error' : ''}`} 
                    value={formData.concreteType2}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Válasszon</option>
                    <option value="acel">Acélszálas (+65.000 Ft)</option>
                    <option value="muanyag">Műanyag szálas (+55.000 Ft)</option>
                    <option value="uveg">Üvegszálas (+59.000 Ft)</option>
                    <option value="nem">Nem szükséges</option>
                  </select>
                  <div className={`ajanlatkeres-error-message ${formErrors.concreteType2 ? 'visible' : ''}`}>{formErrors.concreteType2}</div>
                </div>
                
                <div className="ajanlatkeres-form-group">
                </div>
              </div>

              {serverError && (
                <div className="ajanlatkeres-error-message visible" style={{ textAlign: 'center', marginBottom: '15px' }}>
                  {serverError}
                </div>
              )}

              {calculatedPrice && (
                <div className="ajanlatkeres-price-preview">
                  <h4>Ajánlat előnézet - {calculatedPrice.companyName}</h4>
                  <div className="ajanlatkeres-price-details">
                    <div className="ajanlatkeres-price-row">
                      <span>Beton ({getConcreteTypeText(formData.concreteType)}):</span>
                      <span>{formatPrice(calculatedPrice.betonKoltseg)}</span>
                    </div>
                    {formData.pumpNeeded === 'igen' && (
                      <div className="ajanlatkeres-price-row">
                        <span>Betonpumpa:</span>
                        <span>{formatPrice(calculatedPrice.pumpaKoltseg)}</span>
                      </div>
                    )}
                    {formData.concreteType2 && formData.concreteType2 !== 'nem' && (
                      <div className="ajanlatkeres-price-row">
                        <span>{getBetonszalText(formData.concreteType2)}:</span>
                        <span>{formatPrice(calculatedPrice.betonszalKoltseg)}</span>
                      </div>
                    )}
                    <div className="ajanlatkeres-price-row">
                      <span>Szállítási díj (Keszthelytől):</span>
                      <span>{formatPrice(calculatedPrice.szallitasKoltseg)}</span>
                    </div>
                    <div className="ajanlatkeres-price-row ajanlatkeres-price-total-net">
                      <span>Nettó összeg (áfa nélkül):</span>
                      <span>{formatPrice(calculatedPrice.nettoOsszeg)}</span>
                    </div>
                    <div className="ajanlatkeres-price-row">
                      <span>ÁFA (27%):</span>
                      <span>{formatPrice(calculatedPrice.afaOsszeg)}</span>
                    </div>
                    <div className="ajanlatkeres-price-row ajanlatkeres-price-total-brutto">
                      <span>Végösszeg (bruttó):</span>
                      <span>{formatPrice(calculatedPrice.bruttoOsszeg)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="ajanlatkeres-form-group">
                <label htmlFor="message">Egyéb megjegyzések vagy speciális igények</label>
                <textarea 
                  id="message" 
                  className="ajanlatkeres-form-control" 
                  rows="4" 
                  placeholder="Pl.: nehéz megközelítés, munkaidő korlátozás, stb."
                  value={formData.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="ajanlatkeres-form-group">
                <div className="ajanlatkeres-checkbox-group">
                  <div className="ajanlatkeres-checkbox-item">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className={formErrors.terms ? 'error' : ''}
                      checked={formData.terms}
                      onChange={handleInputChange}
                      required 
                    />
                    <label htmlFor="terms">Elfogadom az <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételeket</a> <span className="ajanlatkeres-required-badge">*</span></label>
                  </div>
                  <div className="ajanlatkeres-checkbox-item">
                    <input 
                      type="checkbox" 
                      id="privacy" 
                      className={formErrors.privacy ? 'error' : ''}
                      checked={formData.privacy}
                      onChange={handleInputChange}
                      required 
                    />
                    <label htmlFor="privacy">Elfogadom az <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi Nyilatkozatot</a> és hozzájárulok személyes adataim kezeléséhez <span className="ajanlatkeres-required-badge">*</span></label>
                  </div>
                </div>
                <div className={`ajanlatkeres-error-message ${formErrors.terms ? 'visible' : ''}`}>{formErrors.terms}</div>
                <div className={`ajanlatkeres-error-message ${formErrors.privacy ? 'visible' : ''}`}>{formErrors.privacy}</div>
              </div>
              
              <div className="ajanlatkeres-submit-btn">
                <button type="submit" className="ajanlatkeres-btn" disabled={!!distanceError || isLoading}>
                  {isLoading ? 'KÜLDÉS...' : 'Ajánlatkérés elküldése'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <div className={`ajanlatkeres-success-modal ${isModalActive ? 'active' : ''}`} ref={modalRef} onClick={handleModalClick}>
        <div className="ajanlatkeres-modal-content">
          <div className="ajanlatkeres-checkmark-circle">
            <i className="fas fa-check"></i>
          </div>
          <h2>Sikeres ajánlatkérés!</h2>
          {offerDetails && (
            <>
              <p>Ajánlatszám: <strong>{offerDetails.number}</strong></p>
              <p>Kiválasztott cég: <strong>{offerDetails.company}</strong></p>
              <p>Nettó összeg: <strong>{offerDetails.nettoPriceFormatted}</strong></p>
              <p>Végösszeg (bruttó): <strong>{offerDetails.bruttoPriceFormatted}</strong></p>
              <p>Ajánlata megtekinthető az <a href="/ajanlataim" onClick={(e) => { e.preventDefault(); navigate('/ajanlataim'); }}>Ajánlataim</a> menüpontban.</p>
            </>
          )}
          <button className="ajanlatkeres-modal-close" onClick={closeModal}>Rendben</button>
        </div>
      </div>

      <footer className="ajanlatkeres-footer">
        <p>BetonLogisztika - Professzionális betonszállítás</p>
        <p>8315 Meleghegyi utca 5., Gyenesdiás | <a href="tel:+36309973432">+36 30 997 3432</a> | <a href="mailto:info@betonlogisztika.hu">info@betonlogisztika.hu</a></p>

        <div className="ajanlatkeres-footer-links">
          <a href="/impresszum" onClick={(e) => handleNavLinkClick(e, '/impresszum')}>Impresszum</a>
          <a href="/adatvedelmi_nyil" onClick={(e) => handleNavLinkClick(e, '/adatvedelmi_nyil')}>Adatvédelmi nyilatkozat</a>
          <a href="/alt_szer_felt" onClick={(e) => handleNavLinkClick(e, '/alt_szer_felt')}>Általános Szerződési Feltételek</a>
        </div>
        
        <div className="ajanlatkeres-social-icons">
          <a href="https://www.facebook.com/betonlogisztika/"><i className="fab fa-facebook"></i></a>
        </div>
        
        <div className="ajanlatkeres-footer-copyright">
          <p>&copy; 2026 Betonlogisztika - Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
};

export default Ajanlatkeres;