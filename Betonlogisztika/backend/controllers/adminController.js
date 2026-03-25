const User = require('../models/User');
const Ajanlat = require('../models/Ajanlat');
const Megrendeles = require('../models/Megrendeles');
const Partner = require('../models/Partner');

const checkAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user && user.jogosultsag === 'admin';
};

// Felhasználók kezelése
const getFelhasznalok = async (req, res) => {
  try {
    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }
    const felhasznalok = await User.findAll();
    res.json({ success: true, felhasznalok });
  } catch (error) {
    console.error('❌ Admin felhasználók hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const updateFelhasznalo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nev, email, cegnev, telefon, jogosultsag } = req.body;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Felhasználó nem található!' });
    }

    if (email && await User.checkEmailExists(email, id)) {
      return res.status(400).json({ success: false, message: 'Ez az email cím már foglalt!' });
    }

    await User.update(id, { nev, email, cegnev, telefon, jogosultsag });
    res.json({ success: true, message: 'Felhasználó adatai frissítve!' });
  } catch (error) {
    console.error('❌ Felhasználó módosítási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const deleteFelhasznalo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Nem törölheted saját magad!' });
    }

    if (await User.hasRelatedData(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'A felhasználónak vannak ajánlatai vagy megrendelései! Előbb azokat kell törölni.' 
      });
    }

    await User.delete(id);
    res.json({ success: true, message: 'Felhasználó sikeresen törölve!' });
  } catch (error) {
    console.error('❌ Felhasználó törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const createFelhasznalo = async (req, res) => {
  try {
    const { nev, email, jelszo, cegnev, telefon, jogosultsag } = req.body;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    if (!nev || !email || !jelszo || !telefon) {
      return res.status(400).json({ success: false, message: 'Minden kötelező mezőt ki kell tölteni!' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Ez az email cím már regisztrálva van!' });
    }

    const userId = await User.create({ nev, email, jelszo, cegnev, telefon, jogosultsag: jogosultsag || 'user' });

    res.status(201).json({
      success: true,
      message: 'Felhasználó sikeresen létrehozva!',
      user: {
        id: userId,
        nev,
        email,
        cegnev: cegnev || null,
        telefon,
        jogosultsag: jogosultsag || 'user'
      }
    });
  } catch (error) {
    console.error('❌ Felhasználó létrehozási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

// Ajánlatok kezelése admin
const getAdminAjanlatok = async (req, res) => {
  try {
    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }
    const ajanlatok = await Ajanlat.findAllAdmin();
    res.json({ success: true, ajanlatok });
  } catch (error) {
    console.error('❌ Admin ajánlatok hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const updateAjanlatStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusz } = req.body;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    await Ajanlat.updateStatus(id, statusz);
    res.json({ success: true, message: 'Státusz módosítva!' });
  } catch (error) {
    console.error('❌ Státusz módosítási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const deleteAdminAjanlat = async (req, res) => {
  try {
    const { id } = req.params;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    await Ajanlat.delete(id);
    res.json({ success: true, message: 'Ajánlat törölve!' });
  } catch (error) {
    console.error('❌ Törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

// Megrendelések kezelése admin
const getAdminMegrendelesek = async (req, res) => {
  try {
    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }
    const megrendelesek = await Megrendeles.findAllAdmin();
    res.json({ success: true, megrendelesek });
  } catch (error) {
    console.error('❌ Admin megrendelések hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const updateMegrendelesStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusz } = req.body;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const megrendeles = await Megrendeles.findById(id);
    if (!megrendeles) {
      return res.status(404).json({ success: false, message: 'Megrendelés nem található!' });
    }

    const regiStatusz = megrendeles.statusz;

    if (statusz === 'sikertelen' && regiStatusz !== 'sikertelen') {
      console.log(`✅ Kapacitás visszaadva: ${megrendeles.mennyiseg} m³ a cégnek (${megrendeles.betongyarto_id}) a ${megrendeles.szallitas_datum} napra`);
      await Partner.felszabaditKapacitas(megrendeles.betongyarto_id, megrendeles.szallitas_datum, megrendeles.mennyiseg);
    }

    if (regiStatusz === 'sikertelen' && statusz !== 'sikertelen') {
      return res.status(400).json({ 
        success: false, 
        message: 'Sikertelen státuszú megrendelés nem állítható vissza más státuszba!' 
      });
    }

    await Megrendeles.updateStatus(id, statusz);

    res.json({ 
      success: true, 
      message: regiStatusz !== 'sikertelen' && statusz === 'sikertelen' 
        ? '✅ Megrendelés elutasítva, kapacitás visszaadva!' 
        : 'Státusz módosítva!' 
    });
  } catch (error) {
    console.error('❌ Státusz módosítási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const deleteAdminMegrendeles = async (req, res) => {
  try {
    const { id } = req.params;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const megrendeles = await Megrendeles.findById(id);
    if (megrendeles && megrendeles.statusz !== 'sikertelen') {
      await Partner.felszabaditKapacitas(megrendeles.betongyarto_id, megrendeles.szallitas_datum, megrendeles.mennyiseg);
      console.log(`✅ Kapacitás visszaadva admin törléskor: ${megrendeles.mennyiseg} m³`);
    }

    await Megrendeles.delete(id);
    res.json({ success: true, message: 'Megrendelés törölve!' });
  } catch (error) {
    console.error('❌ Törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

// Partnerek kezelése
const getPartnerek = async (req, res) => {
  try {
    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }
    const partnerek = await Partner.findAll();
    res.json({ success: true, partnerek });
  } catch (error) {
    console.error('❌ Admin partnerek hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const createPartner = async (req, res) => {
  try {
    const { nev, telephely_nev, latitud, longitud, napi_kapacitas } = req.body;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    if (!nev || !telephely_nev || !napi_kapacitas) {
      return res.status(400).json({ success: false, message: 'Minden kötelező mezőt ki kell tölteni!' });
    }

    const partnerId = await Partner.create({ nev, telephely_nev, latitud, longitud, napi_kapacitas });

    res.status(201).json({
      success: true,
      message: 'Partner sikeresen létrehozva!',
      partner: {
        id: partnerId,
        nev,
        telephely_nev,
        latitud,
        longitud,
        napi_kapacitas
      }
    });
  } catch (error) {
    console.error('❌ Partner létrehozási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba: ' + error.message });
  }
};

const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { nev, telephely_nev, latitud, longitud, napi_kapacitas } = req.body;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner nem található!' });
    }

    await Partner.update(id, { nev, telephely_nev, latitud, longitud, napi_kapacitas });
    res.json({ success: true, message: 'Partner adatai frissítve!' });
  } catch (error) {
    console.error('❌ Partner módosítási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!await checkAdmin(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    if (await Partner.hasArak(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'A partnernek vannak árai! Előbb azokat kell törölni.' 
      });
    }

    if (await Partner.hasFoglalasok(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'A partnernek vannak kapacitás foglalásai! Előbb azokat kell törölni.' 
      });
    }

    await Partner.delete(id);
    res.json({ success: true, message: 'Partner sikeresen törölve!' });
  } catch (error) {
    console.error('❌ Partner törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

module.exports = {
  getFelhasznalok,
  updateFelhasznalo,
  deleteFelhasznalo,
  createFelhasznalo,
  getAdminAjanlatok,
  updateAjanlatStatus,
  deleteAdminAjanlat,
  getAdminMegrendelesek,
  updateMegrendelesStatus,
  deleteAdminMegrendeles,
  getPartnerek,
  createPartner,
  updatePartner,
  deletePartner
};