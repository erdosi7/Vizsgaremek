const Ajanlat = require('../models/Ajanlat');
const Partner = require('../models/Partner');
const BetonTipus = require('../models/BetonTipus');
const BetonszalTipus = require('../models/BetonszalTipus');
const { calculateAr } = require('../utils/helpers');

const createAjanlat = async (req, res) => {
  try {
    console.log('\n📥 ===== ÚJ AJÁNLATKÉRÉS =====');
    console.log('📦 Beérkező adatok:', JSON.stringify(req.body, null, 2));

    const {
      beton_tipus_id,
      betonszal_tipus_id,
      betongyarto_id,
      mennyiseg,
      pumpa_szukseges,
      szallitas_datum,
      iranyitoszam,
      telepules,
      utca,
      hazszam,
      latitude,
      longitude,
      tavolsag_keszthelytol
    } = req.body;

    const userId = req.user.id;

    const partner = await Partner.findById(betongyarto_id);
    if (!partner) {
      return res.status(400).json({ success: false, message: 'Cég nem található!' });
    }

    const { szabad } = await Partner.getKapacitas(betongyarto_id, szallitas_datum);
    if (parseFloat(mennyiseg) > szabad) {
      return res.status(400).json({ 
        success: false, 
        message: `A cégnek ezen a napon csak ${szabad} m³ szabad kapacitása van!` 
      });
    }

    const ar = await BetonTipus.getAr(betongyarto_id, beton_tipus_id);
    if (!ar) {
      return res.status(400).json({ success: false, message: 'Nincs ár ehhez a beton típushoz!' });
    }

    let betonszalAr = 0;
    if (betonszal_tipus_id && betonszal_tipus_id !== 4) {
      const szal = await BetonszalTipus.findById(betonszal_tipus_id);
      if (szal) {
        betonszalAr = szal.egysegar;
      }
    }

    const distance = parseFloat(tavolsag_keszthelytol) || 0;

    const arSzamitas = calculateAr(
      ar.egysegar, 
      mennyiseg, 
      pumpa_szukseges, 
      betonszalAr, 
      distance
    );

    const ajanlatszam = await Ajanlat.generateAjanlatszam();
    console.log('✅ Generált ajánlatszám:', ajanlatszam);

    const ervenyes_ig = new Date();
    ervenyes_ig.setDate(ervenyes_ig.getDate() + 30);
    const ervenyes_ig_str = ervenyes_ig.toISOString().split('T')[0];

    const ajanlatId = await Ajanlat.create({
      felhasznalo_id: userId,
      ajanlatszam,
      beton_tipus_id,
      betonszal_tipus_id,
      betongyarto_id,
      mennyiseg,
      pumpa_szukseges,
      szallitas_datum,
      iranyitoszam,
      telepules,
      utca,
      hazszam,
      latitude,
      longitude,
      tavolsag_keszthelytol: distance,
      beton_koltseg: arSzamitas.betonKoltseg,
      pumpa_koltseg: arSzamitas.pumpaKoltseg,
      betonszal_koltseg: arSzamitas.betonszalKoltseg,
      szallitas_koltseg: arSzamitas.szallitasKoltseg,
      netto_osszeg: arSzamitas.nettoOsszeg,
      afa_osszeg: arSzamitas.afaOsszeg,
      brutto_osszeg: arSzamitas.bruttoOsszeg,
      ervenyes_ig: ervenyes_ig_str
    });

    res.status(201).json({
      success: true,
      message: 'Ajánlat sikeresen mentve!',
      ajanlat: {
        id: ajanlatId,
        ajanlatszam,
        bruttoOsszeg: arSzamitas.bruttoOsszeg,
        nettoOsszeg: arSzamitas.nettoOsszeg,
        status: 'függőben'
      }
    });

  } catch (error) {
    console.error('\n❌ RÉSZLETES HIBA:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Szerver hiba: ' + error.message 
    });
  }
};

const getAjanlataim = async (req, res) => {
  try {
    const userId = req.user.id;
    const ajanlatok = await Ajanlat.findByUser(userId);
    res.json({ success: true, ajanlatok });
  } catch (error) {
    console.error('❌ Ajánlatok lekérési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const deleteAjanlat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`🗑️ Törlési kérés - Ajánlat ID: ${id}, Felhasználó ID: ${userId}`);

    const canDelete = await Ajanlat.canDelete(id, userId);
    if (!canDelete) {
      return res.status(400).json({ 
        success: false, 
        message: 'Csak elutasított vagy lejárt státuszú ajánlat törölhető!' 
      });
    }

    await Ajanlat.delete(id);
    console.log(`✅ Ajánlat törölve: ${id}`);

    res.json({ 
      success: true, 
      message: 'Ajánlat sikeresen törölve!' 
    });

  } catch (error) {
    console.error('❌ Törlési hiba:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Szerver hiba: ' + error.message 
    });
  }
};

module.exports = { createAjanlat, getAjanlataim, deleteAjanlat };