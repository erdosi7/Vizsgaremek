const db = require('../config/database');

class Ajanlat {
  static async create(data) {
    const {
      felhasznalo_id, ajanlatszam, beton_tipus_id, betonszal_tipus_id,
      betongyarto_id, mennyiseg, pumpa_szukseges, szallitas_datum,
      iranyitoszam, telepules, utca, hazszam, latitude, longitude,
      tavolsag_keszthelytol, beton_koltseg, pumpa_koltseg,
      betonszal_koltseg, szallitas_koltseg, netto_osszeg,
      afa_osszeg, brutto_osszeg, ervenyes_ig
    } = data;

    const safeValue = (value) => {
      if (value === undefined || value === null) return 0;
      return value;
    };

    const [result] = await db.query(`
      INSERT INTO ajanlatok (
        felhasznalo_id, ajanlatszam, beton_tipus_id, betonszal_tipus_id,
        betongyarto_id, mennyiseg, pumpa_szukseges, szallitas_datum,
        iranyitoszam, telepules, utca, hazszam, latitude, longitude,
        tavolsag_keszthelytol, beton_koltseg, pumpa_koltseg,
        betonszal_koltseg, szallitas_koltseg, netto_osszeg,
        afa_osszeg, brutto_osszeg, statusz, ervenyes_ig
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      felhasznalo_id, ajanlatszam, beton_tipus_id, betonszal_tipus_id || null,
      betongyarto_id, mennyiseg, pumpa_szukseges ? 1 : 0, szallitas_datum,
      iranyitoszam, telepules, utca, hazszam, latitude || null, longitude || null,
      tavolsag_keszthelytol || null, safeValue(beton_koltseg), safeValue(pumpa_koltseg),
      safeValue(betonszal_koltseg), safeValue(szallitas_koltseg), safeValue(netto_osszeg),
      safeValue(afa_osszeg), safeValue(brutto_osszeg), 'függőben', ervenyes_ig
    ]);

    return result.insertId;
  }

  static async findByUser(userId) {
    const [ajanlatok] = await db.query(`
      SELECT a.*, bt.megnevezes as beton_tipus_nev,
        bsz.megnevezes as betonszal_nev, bg.nev as betongyarto_nev, bg.telephely_nev
      FROM ajanlatok a
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betonszal_tipusok bsz ON a.betonszal_tipus_id = bsz.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      WHERE a.felhasznalo_id = ?
      ORDER BY a.letrehozas_datum DESC
    `, [userId]);
    return ajanlatok;
  }

  static async findById(id, userId = null) {
    let query = `
      SELECT a.*, bg.napi_kapacitas, bg.nev as betongyarto_nev 
      FROM ajanlatok a
      JOIN betongyartok bg ON a.betongyarto_id = bg.id
      WHERE a.id = ?
    `;
    let params = [id];
    if (userId) {
      query += ' AND a.felhasznalo_id = ?';
      params.push(userId);
    }
    const [result] = await db.query(query, params);
    return result[0];
  }

  static async findAllAdmin() {
    const [ajanlatok] = await db.query(`
      SELECT a.*, f.nev as felhasznalo_nev, f.email as felhasznalo_email,
        bt.megnevezes as beton_tipus_nev, bg.nev as betongyarto_nev
      FROM ajanlatok a
      JOIN felhasznalok f ON a.felhasznalo_id = f.id
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      ORDER BY a.letrehozas_datum DESC
    `);
    return ajanlatok;
  }

  static async updateStatus(id, statusz) {
    await db.query('UPDATE ajanlatok SET statusz = ? WHERE id = ?', [statusz, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM ajanlatok WHERE id = ?', [id]);
  }

  static async canDelete(id, userId) {
    const [ajanlat] = await db.query(
      'SELECT statusz FROM ajanlatok WHERE id = ? AND felhasznalo_id = ?',
      [id, userId]
    );
    if (!ajanlat.length) return false;
    return ajanlat[0].statusz === 'elutasítva' || ajanlat[0].statusz === 'lejárt';
  }

  static async generateAjanlatszam() {
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
    return `AJ-${year}-${nextNum.toString().padStart(3, '0')}`;
  }
}

module.exports = Ajanlat;