const db = require('../config/database');

class BetonszalTipus {
  static async findAll() {
    const [tipusok] = await db.query('SELECT * FROM betonszal_tipusok ORDER BY megnevezes');
    return tipusok;
  }

  static async findById(id) {
    const [result] = await db.query('SELECT * FROM betonszal_tipusok WHERE id = ?', [id]);
    return result[0];
  }
}

module.exports = BetonszalTipus;