const db = require('../config/database');

class Partner {
  static async findAll() {
    const [partnerek] = await db.query(`
      SELECT id, nev, telephely_nev, latitude AS latitud, longitude AS longitud,
        napi_kapacitas, website, telefon
      FROM betongyartok
      ORDER BY nev ASC, telephely_nev ASC
    `);
    return partnerek;
  }

  static async findById(id) {
    const [result] = await db.query('SELECT * FROM betongyartok WHERE id = ?', [id]);
    return result[0];
  }

  static async create(data) {
    const { nev, telephely_nev, latitud, longitud, napi_kapacitas } = data;
    const [result] = await db.query(
      `INSERT INTO betongyartok (nev, telephely_nev, latitude, longitude, napi_kapacitas) 
       VALUES (?, ?, ?, ?, ?)`,
      [nev, telephely_nev, latitud || null, longitud || null, napi_kapacitas]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { nev, telephely_nev, latitud, longitud, napi_kapacitas } = data;
    await db.query(
      `UPDATE betongyartok 
       SET nev = ?, telephely_nev = ?, latitude = ?, longitude = ?, napi_kapacitas = ?
       WHERE id = ?`,
      [nev, telephely_nev, latitud || null, longitud || null, napi_kapacitas, id]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM betongyartok WHERE id = ?', [id]);
  }

  static async hasArak(id) {
    const [result] = await db.query('SELECT COUNT(*) as count FROM betongyarto_arak WHERE betongyarto_id = ?', [id]);
    return result[0].count > 0;
  }

  static async hasFoglalasok(id) {
    const [result] = await db.query('SELECT COUNT(*) as count FROM ceg_napi_kapacitas WHERE betongyarto_id = ?', [id]);
    return result[0].count > 0;
  }

  static async getKapacitas(cegId, datum) {
    const [ceg] = await db.query('SELECT napi_kapacitas FROM betongyartok WHERE id = ?', [cegId]);
    if (!ceg.length) return { napiKapacitas: 0, lefoglalt: 0, szabad: 0 };
    
    const [foglalas] = await db.query(
      'SELECT SUM(lefoglalt_mennyiseg) as osszes FROM ceg_napi_kapacitas WHERE betongyarto_id = ? AND datum = ?',
      [cegId, datum]
    );
    const lefoglalt = foglalas[0].osszes || 0;
    const napiKapacitas = ceg[0].napi_kapacitas;
    return { napiKapacitas, lefoglalt, szabad: napiKapacitas - lefoglalt };
  }

  static async foglalKapacitas(cegId, datum, mennyiseg) {
    await db.query(
      `INSERT INTO ceg_napi_kapacitas (betongyarto_id, datum, lefoglalt_mennyiseg) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE lefoglalt_mennyiseg = lefoglalt_mennyiseg + ?`,
      [cegId, datum, mennyiseg, mennyiseg]
    );
  }

  static async felszabaditKapacitas(cegId, datum, mennyiseg) {
    await db.query(
      `UPDATE ceg_napi_kapacitas 
       SET lefoglalt_mennyiseg = lefoglalt_mennyiseg - ? 
       WHERE betongyarto_id = ? AND datum = ?`,
      [mennyiseg, cegId, datum]
    );
  }
}

module.exports = Partner;