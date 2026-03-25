const db = require('../config/database');

class BetonTipus {
  static async findAll() {
    const [tipusok] = await db.query('SELECT * FROM beton_tipusok ORDER BY megnevezes');
    return tipusok;
  }

  static async findById(id) {
    const [result] = await db.query('SELECT * FROM beton_tipusok WHERE id = ?', [id]);
    return result[0];
  }

  static async getAr(cegId, betonTipusId) {
    const [arak] = await db.query(
      'SELECT * FROM betongyarto_arak WHERE betongyarto_id = ? AND beton_tipus_id = ?',
      [cegId, betonTipusId]
    );
    return arak[0];
  }
}

module.exports = BetonTipus;