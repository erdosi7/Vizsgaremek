const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [users] = await db.query('SELECT * FROM felhasznalok WHERE email = ?', [email]);
    return users[0];
  }

  static async findById(id) {
    const [users] = await db.query('SELECT id, nev, email, cegnev, telefon, jogosultsag FROM felhasznalok WHERE id = ?', [id]);
    return users[0];
  }

  static async create(userData) {
    const { nev, email, jelszo, cegnev, telefon, jogosultsag = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(jelszo, 10);
    
    const [result] = await db.query(
      `INSERT INTO felhasznalok (nev, email, jelszo, cegnev, telefon, jogosultsag) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nev, email, hashedPassword, cegnev || null, telefon, jogosultsag]
    );
    
    return result.insertId;
  }

  static async verifyPassword(user, jelszo) {
    return await bcrypt.compare(jelszo, user.jelszo);
  }

  static async findAll() {
    const [felhasznalok] = await db.query(`
      SELECT id, nev, email, cegnev, telefon, jogosultsag, regisztracio_datum
      FROM felhasznalok
      ORDER BY regisztracio_datum DESC
    `);
    return felhasznalok;
  }

  static async update(id, userData) {
    const { nev, email, cegnev, telefon, jogosultsag } = userData;
    await db.query(
      `UPDATE felhasznalok SET nev = ?, email = ?, cegnev = ?, telefon = ?, jogosultsag = ? WHERE id = ?`,
      [nev, email, cegnev || null, telefon, jogosultsag, id]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM felhasznalok WHERE id = ?', [id]);
  }

  static async hasRelatedData(id) {
    const [ajanlatok] = await db.query('SELECT COUNT(*) as count FROM ajanlatok WHERE felhasznalo_id = ?', [id]);
    const [megrendelesek] = await db.query('SELECT COUNT(*) as count FROM megrendelesek WHERE felhasznalo_id = ?', [id]);
    return ajanlatok[0].count > 0 || megrendelesek[0].count > 0;
  }

  static async checkEmailExists(email, excludeId = null) {
    let query = 'SELECT id FROM felhasznalok WHERE email = ?';
    let params = [email];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [result] = await db.query(query, params);
    return result.length > 0;
  }
}

module.exports = User;