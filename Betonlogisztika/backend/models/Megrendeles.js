const db = require('../config/database');

class Megrendeles {
  static async create(data) {
    const {
      ajanlat_id, felhasznalo_id, megrendeles_szam, adoszam, megjegyzes,
      brutto_osszeg, szallitas_datum, szallitas_iranyitoszam,
      szallitas_telepules, szallitas_utca, szallitas_hazszam,
      szamlazasi_iranyitoszam, szamlazasi_telepules, szamlazasi_utca,
      szamlazasi_hazszam
    } = data;

    const [result] = await db.query(`
      INSERT INTO megrendelesek (
        ajanlat_id, felhasznalo_id, megrendeles_szam, adoszam, megjegyzes,
        brutto_osszeg, statusz, szallitas_datum, szallitas_iranyitoszam,
        szallitas_telepules, szallitas_utca, szallitas_hazszam,
        szamlazasi_iranyitoszam, szamlazasi_telepules, szamlazasi_utca,
        szamlazasi_hazszam
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ajanlat_id, felhasznalo_id, megrendeles_szam, adoszam, megjegyzes || null,
      brutto_osszeg, 'feldolgozás alatt', szallitas_datum,
      szallitas_iranyitoszam || null, szallitas_telepules || null,
      szallitas_utca || null, szallitas_hazszam || null,
      szamlazasi_iranyitoszam, szamlazasi_telepules, szamlazasi_utca,
      szamlazasi_hazszam
    ]);

    return result.insertId;
  }

  static async findByUser(userId) {
    const [megrendelesek] = await db.query(`
      SELECT m.*, a.ajanlatszam, a.beton_tipus_id, a.betonszal_tipus_id,
        a.betongyarto_id, a.mennyiseg, a.brutto_osszeg,
        bt.megnevezes as beton_tipus_nev, bsz.megnevezes as betonszal_nev,
        bg.nev as betongyarto_nev
      FROM megrendelesek m
      JOIN ajanlatok a ON m.ajanlat_id = a.id
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betonszal_tipusok bsz ON a.betonszal_tipus_id = bsz.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      WHERE m.felhasznalo_id = ?
      ORDER BY m.letrehozas_datum DESC
    `, [userId]);
    return megrendelesek;
  }

  static async findById(id) {
    const [result] = await db.query(`
      SELECT m.*, a.betongyarto_id, a.mennyiseg, a.szallitas_datum
      FROM megrendelesek m
      JOIN ajanlatok a ON m.ajanlat_id = a.id
      WHERE m.id = ?
    `, [id]);
    return result[0];
  }

  static async findAllAdmin() {
    const [megrendelesek] = await db.query(`
      SELECT m.*, a.ajanlatszam, a.beton_tipus_id, a.mennyiseg, a.brutto_osszeg,
        f.nev as felhasznalo_nev, f.email as felhasznalo_email,
        bt.megnevezes as beton_tipus_nev, bg.nev as betongyarto_nev
      FROM megrendelesek m
      JOIN ajanlatok a ON m.ajanlat_id = a.id
      JOIN felhasznalok f ON m.felhasznalo_id = f.id
      LEFT JOIN beton_tipusok bt ON a.beton_tipus_id = bt.id
      LEFT JOIN betongyartok bg ON a.betongyarto_id = bg.id
      ORDER BY m.letrehozas_datum DESC
    `);
    return megrendelesek;
  }

  static async updateStatus(id, statusz) {
    await db.query('UPDATE megrendelesek SET statusz = ? WHERE id = ?', [statusz, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM megrendelesek WHERE id = ?', [id]);
  }

  static async canDelete(id, userId) {
    const [megrendeles] = await db.query(
      'SELECT statusz FROM megrendelesek WHERE id = ? AND felhasznalo_id = ?',
      [id, userId]
    );
    if (!megrendeles.length) return false;
    return megrendeles[0].statusz === 'sikertelen';
  }

  static async generateMegrendelesSzam() {
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
    return `MEG-${year}-${nextNum.toString().padStart(3, '0')}`;
  }
}

module.exports = Megrendeles;