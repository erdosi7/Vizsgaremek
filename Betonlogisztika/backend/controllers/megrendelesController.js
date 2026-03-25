const db = require('../config/database');
const Megrendeles = require('../models/Megrendeles');
const Ajanlat = require('../models/Ajanlat');
const Partner = require('../models/Partner');

const createMegrendeles = async (req, res) => {
  try {
    console.log('\n📥 ===== ÚJ MEGRENDELÉS =====');
    console.log('📦 Beérkező adatok:', JSON.stringify(req.body, null, 2));

    const {
      ajanlat_id,
      szallitas_iranyitoszam,
      szallitas_telepules,
      szallitas_utca,
      szallitas_hazszam,
      szamlazasi_iranyitoszam,
      szamlazasi_telepules,
      szamlazasi_utca,
      szamlazasi_hazszam,
      adoszam,
      megjegyzes
    } = req.body;

    const userId = req.user.id;
    const ajanlat = await Ajanlat.findById(ajanlat_id, userId);

    if (!ajanlat) {
      return res.status(404).json({ success: false, message: 'Ajánlat nem található!' });
    }

    const ma = new Date();
    const ervenyesIg = new Date(ajanlat.ervenyes_ig);
    
    if (ervenyesIg < ma) {
      return res.status(400).json({ success: false, message: 'Az ajánlat már lejárt!' });
    }

    if (ajanlat.statusz !== 'elfogadva') {
      return res.status(400).json({ success: false, message: 'Csak elfogadott ajánlat rendelhető meg!' });
    }

    const { szabad } = await Partner.getKapacitas(ajanlat.betongyarto_id, ajanlat.szallitas_datum);
    const mennyiseg = parseFloat(ajanlat.mennyiseg);

    if (mennyiseg > szabad) {
      return res.status(400).json({ 
        success: false, 
        message: `A cégnek ezen a napon csak ${szabad} m³ szabad kapacitása van!` 
      });
    }

    await Partner.foglalKapacitas(ajanlat.betongyarto_id, ajanlat.szallitas_datum, mennyiseg);

    const megrendelesSzam = await Megrendeles.generateMegrendelesSzam();
    console.log('✅ Generált megrendelésszám:', megrendelesSzam);

    const megrendelesId = await Megrendeles.create({
      ajanlat_id,
      felhasznalo_id: userId,
      megrendeles_szam: megrendelesSzam,
      adoszam,
      megjegyzes,
      brutto_osszeg: ajanlat.brutto_osszeg,
      szallitas_datum: ajanlat.szallitas_datum,
      szallitas_iranyitoszam,
      szallitas_telepules,
      szallitas_utca,
      szallitas_hazszam,
      szamlazasi_iranyitoszam,
      szamlazasi_telepules,
      szamlazasi_utca,
      szamlazasi_hazszam
    });

    await Ajanlat.updateStatus(ajanlat_id, 'megrendelve');

    res.status(201).json({
      success: true,
      message: 'Megrendelés sikeresen létrehozva!',
      megrendeles: {
        id: megrendelesId,
        megrendeles_szam: megrendelesSzam,
        statusz: 'feldolgozás alatt'
      }
    });

  } catch (error) {
    console.error('\n❌ RÉSZLETES HIBA:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba: ' + error.message });
  }
};

const getMegrendeleim = async (req, res) => {
  try {
    const userId = req.user.id;
    const megrendelesek = await Megrendeles.findByUser(userId);
    res.json({ success: true, megrendelesek });
  } catch (error) {
    console.error('❌ Megrendelések lekérési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const deleteMegrendeles = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`🗑️ Törlési kérés - Megrendelés ID: ${id}, Felhasználó ID: ${userId}`);

    const [megrendeles] = await db.query(
      'SELECT * FROM megrendelesek WHERE id = ? AND felhasznalo_id = ?',
      [id, userId]
    );

    if (!megrendeles || megrendeles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Megrendelés nem található!' 
      });
    }

    const order = megrendeles[0];

    if (order.statusz !== 'sikertelen') {
      return res.status(400).json({ 
        success: false, 
        message: 'Csak sikertelen státuszú megrendelés törölhető!' 
      });
    }

    await db.query('DELETE FROM megrendelesek WHERE id = ?', [id]);

    console.log(`✅ Megrendelés törölve: ${id}`);

    res.json({ 
      success: true, 
      message: 'Megrendelés sikeresen törölve!' 
    });

  } catch (error) {
    console.error('❌ Törlési hiba:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Szerver hiba: ' + error.message 
    });
  }
};

module.exports = { createMegrendeles, getMegrendeleim, deleteMegrendeles };