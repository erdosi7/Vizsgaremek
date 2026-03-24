const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Nincs bejelentkezve!' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'titkos_kod_valtoztasd_meg', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Lejárt vagy érvénytelen token!' });
    }
    req.user = user;
    next();
  });
};

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beton_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Sikeresen csatlakozva a MySQL adatbázishoz');
    
    const [tables] = await db.query('SHOW TABLES');
    console.log('📊 Elérhető táblák:', tables.map(t => Object.values(t)[0]));
    
    connection.release();
  } catch (err) {
    console.error('❌ Adatbázis kapcsolódási hiba:', err);
  }
})();

app.get('/', (req, res) => {
  res.send('🚀 BetonLogisztika API fut!');
});

app.post('/api/register', async (req, res) => {
  try {
    const { nev, email, jelszo, cegnev, telefon } = req.body;

    if (!nev || !email || !jelszo || !telefon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Minden kötelező mezőt ki kell tölteni!' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Érvénytelen email formátum!' 
      });
    }

    if (jelszo.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie!' 
      });
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM felhasznalok WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ez az email cím már regisztrálva van!' 
      });
    }

    const hashedPassword = await bcrypt.hash(jelszo, 10);

    const [result] = await db.query(
      `INSERT INTO felhasznalok (nev, email, jelszo, cegnev, telefon, jogosultsag) 
       VALUES (?, ?, ?, ?, ?, 'user')`,
      [nev, email, hashedPassword, cegnev || null, telefon]
    );

    const token = jwt.sign(
      { id: result.insertId, email: email, jogosultsag: 'user' },
      process.env.JWT_SECRET || 'titkos_kod_valtoztasd_meg',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Sikeres regisztráció!',
      token,
      user: {
        id: result.insertId,
        nev,
        email,
        cegnev: cegnev || null,
        telefon,
        jogosultsag: 'user'
      }
    });

  } catch (error) {
    console.error('❌ Regisztrációs hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.get('/api/admin/felhasznalok', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [felhasznalok] = await db.query(`
      SELECT 
        id, 
        nev, 
        email, 
        cegnev, 
        telefon, 
        jogosultsag,
        regisztracio_datum
      FROM felhasznalok
      ORDER BY regisztracio_datum DESC
    `);

    res.json({ success: true, felhasznalok });
  } catch (error) {
    console.error('❌ Admin felhasználók hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.put('/api/admin/felhasznalok/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nev, email, cegnev, telefon, jogosultsag } = req.body;
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [existingUser] = await db.query('SELECT id FROM felhasznalok WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ success: false, message: 'Felhasználó nem található!' });
    }

    if (email) {
      const [emailCheck] = await db.query(
        'SELECT id FROM felhasznalok WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Ez az email cím már foglalt!' });
      }
    }

    await db.query(
      `UPDATE felhasznalok 
       SET nev = ?, email = ?, cegnev = ?, telefon = ?, jogosultsag = ?
       WHERE id = ?`,
      [nev, email, cegnev || null, telefon, jogosultsag, id]
    );

    res.json({ success: true, message: 'Felhasználó adatai frissítve!' });
  } catch (error) {
    console.error('❌ Felhasználó módosítási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.delete('/api/admin/felhasznalok/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Nem törölheted saját magad!' });
    }

    const [ajanlatok] = await db.query('SELECT COUNT(*) as count FROM ajanlatok WHERE felhasznalo_id = ?', [id]);
    const [megrendelesek] = await db.query('SELECT COUNT(*) as count FROM megrendelesek WHERE felhasznalo_id = ?', [id]);

    if (ajanlatok[0].count > 0 || megrendelesek[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A felhasználónak vannak ajánlatai vagy megrendelései! Előbb azokat kell törölni.' 
      });
    }

    await db.query('DELETE FROM felhasznalok WHERE id = ?', [id]);

    res.json({ success: true, message: 'Felhasználó sikeresen törölve!' });
  } catch (error) {
    console.error('❌ Felhasználó törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.post('/api/admin/felhasznalok', authenticateToken, async (req, res) => {
  try {
    const { nev, email, jelszo, cegnev, telefon, jogosultsag } = req.body;
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    if (!nev || !email || !jelszo || !telefon) {
      return res.status(400).json({ success: false, message: 'Minden kötelező mezőt ki kell tölteni!' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Érvénytelen email formátum!' });
    }

    if (jelszo.length < 6) {
      return res.status(400).json({ success: false, message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie!' });
    }

    const [existingUsers] = await db.query('SELECT id FROM felhasznalok WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Ez az email cím már regisztrálva van!' });
    }

    const hashedPassword = await bcrypt.hash(jelszo, 10);

    const [result] = await db.query(
      `INSERT INTO felhasznalok (nev, email, jelszo, cegnev, telefon, jogosultsag, regisztracio_datum) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [nev, email, hashedPassword, cegnev || null, telefon, jogosultsag || 'user']
    );

    res.status(201).json({
      success: true,
      message: 'Felhasználó sikeresen létrehozva!',
      user: {
        id: result.insertId,
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
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, jelszo } = req.body;

    if (!email || !jelszo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email és jelszó megadása kötelező!' 
      });
    }

    const [users] = await db.query(
      'SELECT * FROM felhasznalok WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Hibás email vagy jelszó!' 
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(jelszo, user.jelszo);

    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Hibás email vagy jelszó!' 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, jogosultsag: user.jogosultsag || 'user' },
      process.env.JWT_SECRET || 'titkos_kod_valtoztasd_meg',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Sikeres bejelentkezés!',
      token,
      user: {
        id: user.id,
        nev: user.nev,
        email: user.email,
        cegnev: user.cegnev,
        telefon: user.telefon,
        jogosultsag: user.jogosultsag || 'user'
      }
    });

  } catch (error) {
    console.error('❌ Bejelentkezési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.post('/api/ajanlatok', authenticateToken, async (req, res) => {
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

    const [ceg] = await db.query(
      'SELECT * FROM betongyartok WHERE id = ?',
      [betongyarto_id]
    );

    if (ceg.length === 0) {
      return res.status(400).json({ success: false, message: 'Cég nem található!' });
    }

    const [foglalas] = await db.query(
      'SELECT SUM(lefoglalt_mennyiseg) as osszes FROM ceg_napi_kapacitas WHERE betongyarto_id = ? AND datum = ?',
      [betongyarto_id, szallitas_datum]
    );

    const lefoglalt = foglalas[0].osszes || 0;
    const napiKapacitas = ceg[0].napi_kapacitas;
    const szabadKapacitas = napiKapacitas - lefoglalt;

    if (parseFloat(mennyiseg) > szabadKapacitas) {
      return res.status(400).json({ 
        success: false, 
        message: `A cégnek ezen a napon csak ${szabadKapacitas} m³ szabad kapacitása van!` 
      });
    }

    const [arak] = await db.query(
      'SELECT * FROM betongyarto_arak WHERE betongyarto_id = ? AND beton_tipus_id = ?',
      [betongyarto_id, beton_tipus_id]
    );

    if (arak.length === 0) {
      return res.status(400).json({ success: false, message: 'Nincs ár ehhez a beton típushoz!' });
    }

    const betonAr = arak[0].egysegar;

    let betonszalKoltseg = 0;
    if (betonszal_tipus_id && betonszal_tipus_id !== 4) {
      const [szalak] = await db.query(
        'SELECT * FROM betonszal_tipusok WHERE id = ?',
        [betonszal_tipus_id]
      );
      if (szalak.length > 0) {
        betonszalKoltseg = szalak[0].egysegar;
      }
    }

    const quantity = parseFloat(mennyiseg);
    const betonKoltseg = betonAr * quantity;
    const pumpaKoltseg = pumpa_szukseges ? 50000 : 0;
    
    let szallitasKoltseg = 0;
    if (tavolsag_keszthelytol <= 10) {
      szallitasKoltseg = 4000 * quantity;
    } else {
      const extraDistance = tavolsag_keszthelytol - 10;
      const extraBlocks = Math.ceil(extraDistance / 5);
      szallitasKoltseg = (4000 * quantity) + (extraBlocks * 700 * quantity);
    }

    const nettoOsszeg = betonKoltseg + pumpaKoltseg + betonszalKoltseg + szallitasKoltseg;
    const afaOsszeg = Math.round(nettoOsszeg * 0.27);
    const bruttoOsszeg = nettoOsszeg + afaOsszeg;
    const year = new Date().getFullYear();
    const [rows] = await db.query(
      `SELECT ajanlatszam FROM ajanlatok 
       WHERE ajanlatszam LIKE ? 
       ORDER BY CAST(SUBSTRING_INDEX(ajanlatszam, '-', -1) AS UNSIGNED) DESC 
       LIMIT 1`,
      [`AJ-${year}-%`]
    );

    let nextNum = 1;
    if (rows.length > 0) {
      const lastNum = parseInt(rows[0].ajanlatszam.split('-')[2]);
      nextNum = lastNum + 1;
    }

    const ajanlatszam = `AJ-${year}-${nextNum.toString().padStart(3, '0')}`;
    console.log('✅ Generált ajánlatszám:', ajanlatszam);

    const ervenyes_ig = new Date();
    ervenyes_ig.setDate(ervenyes_ig.getDate() + 30);
    const ervenyes_ig_str = ervenyes_ig.toISOString().split('T')[0];

    const insertQuery = `
      INSERT INTO ajanlatok (
        felhasznalo_id, ajanlatszam, beton_tipus_id, betonszal_tipus_id,
        betongyarto_id, mennyiseg, pumpa_szukseges, szallitas_datum,
        iranyitoszam, telepules, utca, hazszam,
        latitude, longitude, tavolsag_keszthelytol,
        beton_koltseg, pumpa_koltseg, betonszal_koltseg, szallitas_koltseg,
        netto_osszeg, afa_osszeg, brutto_osszeg, statusz, ervenyes_ig
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId, ajanlatszam, beton_tipus_id, betonszal_tipus_id || null,
      betongyarto_id, mennyiseg, pumpa_szukseges ? 1 : 0, szallitas_datum,
      iranyitoszam, telepules, utca, hazszam,
      latitude || null, longitude || null, tavolsag_keszthelytol || null,
      betonKoltseg, pumpaKoltseg, betonszalKoltseg, szallitasKoltseg,
      nettoOsszeg, afaOsszeg, bruttoOsszeg, 'függőben', ervenyes_ig_str
    ];

    const [result] = await db.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Ajánlat sikeresen mentve!',
      ajanlat: {
        id: result.insertId,
        ajanlatszam,
        bruttoOsszeg,
        nettoOsszeg,
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
});

app.get('/api/ajanlataim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [ajanlatok] = await db.query(
      `SELECT 
        a.*,
        bt.megnevezes as beton_tipus_nev,
        bsz.megnevezes as betonszal_nev,
        bg.nev as betongyarto_nev,
        bg.telephely_nev
      FROM ajanlatok a
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betonszal_tipusok bsz ON a.betonszal_tipus_id = bsz.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      WHERE a.felhasznalo_id = ?
      ORDER BY a.letrehozas_datum DESC`,
      [userId]
    );

    res.json({ success: true, ajanlatok });

  } catch (error) {
    console.error('❌ Ajánlatok lekérési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.post('/api/megrendelesek', authenticateToken, async (req, res) => {
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
    const [ajanlat] = await db.query(
      `SELECT a.*, bg.napi_kapacitas, bg.nev as betongyarto_nev 
       FROM ajanlatok a
       JOIN betongyartok bg ON a.betongyarto_id = bg.id
       WHERE a.id = ? AND a.felhasznalo_id = ?`,
      [ajanlat_id, userId]
    );

    if (ajanlat.length === 0) {
      return res.status(404).json({ success: false, message: 'Ajánlat nem található!' });
    }

    const ajanlatAdat = ajanlat[0];

    const ma = new Date();
    const ervenyesIg = new Date(ajanlatAdat.ervenyes_ig);
    
    if (ervenyesIg < ma) {
      return res.status(400).json({ success: false, message: 'Az ajánlat már lejárt!' });
    }

    if (ajanlatAdat.statusz !== 'elfogadva') {
      return res.status(400).json({ success: false, message: 'Csak elfogadott ajánlat rendelhető meg!' });
    }

    const [foglalas] = await db.query(
      'SELECT SUM(lefoglalt_mennyiseg) as osszes FROM ceg_napi_kapacitas WHERE betongyarto_id = ? AND datum = ?',
      [ajanlatAdat.betongyarto_id, ajanlatAdat.szallitas_datum]
    );

    const lefoglalt = foglalas[0].osszes || 0;
    const napiKapacitas = ajanlatAdat.napi_kapacitas;
    const szabadKapacitas = napiKapacitas - lefoglalt;
    const mennyiseg = parseFloat(ajanlatAdat.mennyiseg);

    if (mennyiseg > szabadKapacitas) {
      return res.status(400).json({ 
        success: false, 
        message: `A cégnek ezen a napon csak ${szabadKapacitas} m³ szabad kapacitása van!` 
      });
    }

    await db.query(
      `INSERT INTO ceg_napi_kapacitas (betongyarto_id, datum, lefoglalt_mennyiseg) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE lefoglalt_mennyiseg = lefoglalt_mennyiseg + ?`,
      [ajanlatAdat.betongyarto_id, ajanlatAdat.szallitas_datum, mennyiseg, mennyiseg]
    );

    const year = new Date().getFullYear();

    const [rows] = await db.query(
      `SELECT megrendeles_szam FROM megrendelesek 
       WHERE megrendeles_szam LIKE ? 
       ORDER BY CAST(SUBSTRING_INDEX(megrendeles_szam, '-', -1) AS UNSIGNED) DESC 
       LIMIT 1`,
      [`MEG-${year}-%`]
    );

    let nextNum = 1;
    if (rows.length > 0) {
      const lastNum = parseInt(rows[0].megrendeles_szam.split('-')[2]);
      nextNum = lastNum + 1;
    }

    const megrendelesSzam = `MEG-${year}-${nextNum.toString().padStart(3, '0')}`;
    console.log('✅ Generált megrendelésszám:', megrendelesSzam);

    const [result] = await db.query(
      `INSERT INTO megrendelesek (
        ajanlat_id, 
        felhasznalo_id, 
        megrendeles_szam,
        adoszam, 
        megjegyzes, 
        brutto_osszeg, 
        statusz, 
        szallitas_datum, 
        szallitas_iranyitoszam, 
        szallitas_telepules, 
        szallitas_utca, 
        szallitas_hazszam,
        szamlazasi_iranyitoszam, 
        szamlazasi_telepules, 
        szamlazasi_utca, 
        szamlazasi_hazszam
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ajanlat_id, 
        userId, 
        megrendelesSzam,
        adoszam, 
        megjegyzes || null, 
        ajanlatAdat.brutto_osszeg, 
        'feldolgozás alatt',
        ajanlatAdat.szallitas_datum, 
        szallitas_iranyitoszam || null, 
        szallitas_telepules || null, 
        szallitas_utca || null, 
        szallitas_hazszam || null,
        szamlazasi_iranyitoszam, 
        szamlazasi_telepules, 
        szamlazasi_utca, 
        szamlazasi_hazszam
      ]
    );

    await db.query(
      'UPDATE ajanlatok SET statusz = ? WHERE id = ?',
      ['megrendelve', ajanlat_id]
    );

    res.status(201).json({
      success: true,
      message: 'Megrendelés sikeresen létrehozva!',
      megrendeles: {
        id: result.insertId,
        megrendeles_szam: megrendelesSzam,
        statusz: 'feldolgozás alatt'
      }
    });

  } catch (error) {
    console.error('\n❌ RÉSZLETES HIBA:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba: ' + error.message });
  }
});

app.delete('/api/megrendelesek/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`🗑️ Törlési kérés - Megrendelés ID: ${id}, Felhasználó ID: ${userId}`);

    const [megrendeles] = await db.query(
      'SELECT * FROM megrendelesek WHERE id = ? AND felhasznalo_id = ?',
      [id, userId]
    );

    if (megrendeles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Megrendelés nem található vagy nincs jogosultságod!' 
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
});

app.delete('/api/ajanlatok/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`🗑️ Törlési kérés - Ajánlat ID: ${id}, Felhasználó ID: ${userId}`);

    const [ajanlat] = await db.query(
      'SELECT * FROM ajanlatok WHERE id = ? AND felhasznalo_id = ?',
      [id, userId]
    );

    if (ajanlat.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ajánlat nem található vagy nincs jogosultságod!' 
      });
    }

    const offer = ajanlat[0];

    if (offer.statusz !== 'elutasítva' && offer.statusz !== 'lejárt') {
      return res.status(400).json({ 
        success: false, 
        message: 'Csak elutasított vagy lejárt státuszú ajánlat törölhető!' 
      });
    }

    await db.query('DELETE FROM ajanlatok WHERE id = ?', [id]);

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
});

app.delete('/api/admin/ajanlatok/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    await db.query('DELETE FROM ajanlatok WHERE id = ?', [id]);

    console.log(`✅ Admin törölte az ajánlatot: ${id}`);

    res.json({ 
      success: true, 
      message: 'Ajánlat sikeresen törölve!' 
    });

  } catch (error) {
    console.error('❌ Admin törlési hiba:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Szerver hiba: ' + error.message 
    });
  }
});

app.get('/api/megrendeleim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [megrendelesek] = await db.query(
      `SELECT 
        m.*,
        a.ajanlatszam,
        a.beton_tipus_id,
        a.betonszal_tipus_id,
        a.betongyarto_id,
        a.mennyiseg,
        a.brutto_osszeg,
        bt.megnevezes as beton_tipus_nev,
        bsz.megnevezes as betonszal_nev,
        bg.nev as betongyarto_nev
      FROM megrendelesek m
      JOIN ajanlatok a ON m.ajanlat_id = a.id
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betonszal_tipusok bsz ON a.betonszal_tipus_id = bsz.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      WHERE m.felhasznalo_id = ?
      ORDER BY m.letrehozas_datum DESC`,
      [userId]
    );

    res.json({ success: true, megrendelesek });

  } catch (error) {
    console.error('❌ Megrendelések lekérési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.get('/api/admin/ajanlatok', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [ajanlatok] = await db.query(`
      SELECT 
        a.*,
        f.nev as felhasznalo_nev,
        f.email as felhasznalo_email,
        bt.megnevezes as beton_tipus_nev,
        bg.nev as betongyarto_nev
      FROM ajanlatok a
      JOIN felhasznalok f ON a.felhasznalo_id = f.id
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      ORDER BY a.letrehozas_datum DESC
    `);

    res.json({ success: true, ajanlatok });
  } catch (error) {
    console.error('❌ Admin ajánlatok hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.put('/api/admin/ajanlatok/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { statusz } = req.body;

    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    await db.query('UPDATE ajanlatok SET statusz = ? WHERE id = ?', [statusz, id]);
    res.json({ success: true, message: 'Státusz módosítva!' });

  } catch (error) {
    console.error('❌ Státusz módosítási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.delete('/api/admin/ajanlatok/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    await db.query('DELETE FROM ajanlatok WHERE id = ?', [id]);
    res.json({ success: true, message: 'Ajánlat törölve!' });

  } catch (error) {
    console.error('❌ Törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.get('/api/admin/megrendelesek', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [megrendelesek] = await db.query(
      `SELECT 
        m.*,
        a.ajanlatszam,
        a.beton_tipus_id,
        a.mennyiseg,
        a.brutto_osszeg,
        f.nev as felhasznalo_nev,
        f.email as felhasznalo_email,
        bt.megnevezes as beton_tipus_nev,
        bg.nev as betongyarto_nev
      FROM megrendelesek m
      JOIN ajanlatok a ON m.ajanlat_id = a.id
      JOIN felhasznalok f ON m.felhasznalo_id = f.id
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      ORDER BY m.letrehozas_datum DESC`
    );

    res.json({ success: true, megrendelesek });

  } catch (error) {
    console.error('❌ Admin megrendelések hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.put('/api/admin/megrendelesek/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { statusz } = req.body;

    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [megrendeles] = await db.query(
      `SELECT m.*, a.betongyarto_id, a.mennyiseg, a.szallitas_datum 
       FROM megrendelesek m
       JOIN ajanlatok a ON m.ajanlat_id = a.id
       WHERE m.id = ?`,
      [id]
    );

    if (megrendeles.length === 0) {
      return res.status(404).json({ success: false, message: 'Megrendelés nem található!' });
    }

    const order = megrendeles[0];
    const regiStatusz = order.statusz;

    if (statusz === 'sikertelen' && regiStatusz !== 'sikertelen') {
      console.log(`✅ Kapacitás visszaadva: ${order.mennyiseg} m³ a cégnek (${order.betongyarto_id}) a ${order.szallitas_datum} napra`);
      
      await db.query(
        `UPDATE ceg_napi_kapacitas 
         SET lefoglalt_mennyiseg = lefoglalt_mennyiseg - ? 
         WHERE betongyarto_id = ? AND datum = ?`,
        [order.mennyiseg, order.betongyarto_id, order.szallitas_datum]
      );
    }

    if (regiStatusz === 'sikertelen' && statusz !== 'sikertelen') {
      return res.status(400).json({ 
        success: false, 
        message: 'Sikertelen státuszú megrendelés nem állítható vissza más státuszba!' 
      });
    }

    await db.query('UPDATE megrendelesek SET statusz = ? WHERE id = ?', [statusz, id]);

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
});

app.delete('/api/admin/megrendelesek/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [megrendeles] = await db.query(
      `SELECT m.*, a.betongyarto_id, a.mennyiseg, a.szallitas_datum 
       FROM megrendelesek m
       JOIN ajanlatok a ON m.ajanlat_id = a.id
       WHERE m.id = ?`,
      [id]
    );

    if (megrendeles.length > 0) {
      const order = megrendeles[0];

      if (order.statusz !== 'sikertelen') {
        await db.query(
          `UPDATE ceg_napi_kapacitas 
           SET lefoglalt_mennyiseg = lefoglalt_mennyiseg - ? 
           WHERE betongyarto_id = ? AND datum = ?`,
          [order.mennyiseg, order.betongyarto_id, order.szallitas_datum]
        );
        console.log(`✅ Kapacitás visszaadva admin törléskor: ${order.mennyiseg} m³`);
      }
    }

    await db.query('DELETE FROM megrendelesek WHERE id = ?', [id]);
    res.json({ success: true, message: 'Megrendelés törölve!' });

  } catch (error) {
    console.error('❌ Törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Szerver fut a ${PORT}-es porton`);
  console.log(`🔗 http://localhost:${PORT}`);
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Szerver fut a ${PORT}-es porton`);
    console.log(`🔗 http://localhost:${PORT}`);
  });
}

app.get('/api/admin/partnerek', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [partnerek] = await db.query(`
      SELECT 
  id,
  nev,
  telephely_nev,
  latitude AS latitud,
  longitude AS longitud,
  napi_kapacitas,
  website,
  telefon
FROM betongyartok
      ORDER BY nev ASC, telephely_nev ASC
    `);

    res.json({ success: true, partnerek });
  } catch (error) {
    console.error('❌ Admin partnerek hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.post('/api/admin/partnerek', authenticateToken, async (req, res) => {
  try {
    const { nev, telephely_nev, latitud, longitud, napi_kapacitas } = req.body;

    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    if (!nev || !telephely_nev || !napi_kapacitas) {
      return res.status(400).json({ success: false, message: 'Minden kötelező mezőt ki kell tölteni!' });
    }

    const [result] = await db.query(
      `INSERT INTO betongyartok (nev, telephely_nev, latitude, longitude, napi_kapacitas) 
       VALUES (?, ?, ?, ?, ?)`,
      [nev, telephely_nev, latitud || null, longitud || null, napi_kapacitas]
    );

    res.status(201).json({
      success: true,
      message: 'Partner sikeresen létrehozva!',
      partner: {
        id: result.insertId,
        nev,
        telephely_nev,
        latitud,
        longitud,
        napi_kapacitas
      }
    });

  } catch (error) {
  console.error('❌ Partner létrehozási RÉSZLETES HIBA:', error);
  console.error('❌ Hiba üzenet:', error.message);
  console.error('❌ Hiba stack:', error.stack);
  res.status(500).json({ success: false, message: 'Szerver hiba: ' + error.message });
}
});

app.put('/api/admin/partnerek/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nev, telephely_nev, latitud, longitud, napi_kapacitas } = req.body;

    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [existing] = await db.query('SELECT id FROM betongyartok WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner nem található!' });
    }

    await db.query(
      `UPDATE betongyartok 
       SET nev = ?, telephely_nev = ?, latitude = ?, longitude = ?, napi_kapacitas = ?
       WHERE id = ?`,
      [nev, telephely_nev, latitude || null, longitude || null, napi_kapacitas, id]
    );

    res.json({ success: true, message: 'Partner adatai frissítve!' });

  } catch (error) {
    console.error('❌ Partner módosítási hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

app.delete('/api/admin/partnerek/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!user.length || user[0].jogosultsag !== 'admin') {
      return res.status(403).json({ success: false, message: 'Nincs jogosultságod!' });
    }

    const [arak] = await db.query('SELECT COUNT(*) as count FROM betongyarto_arak WHERE betongyarto_id = ?', [id]);
    if (arak[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A partnernek vannak árai! Előbb azokat kell törölni.' 
      });
    }

    const [foglalasok] = await db.query('SELECT COUNT(*) as count FROM ceg_napi_kapacitas WHERE betongyarto_id = ?', [id]);
    if (foglalasok[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A partnernek vannak kapacitás foglalásai! Előbb azokat kell törölni.' 
      });
    }

    await db.query('DELETE FROM betongyartok WHERE id = ?', [id]);

    res.json({ success: true, message: 'Partner sikeresen törölve!' });

  } catch (error) {
    console.error('❌ Partner törlési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
});

module.exports = app;