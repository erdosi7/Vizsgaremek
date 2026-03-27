const mysql = require('mysql2');
require('dotenv').config();

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

module.exports = db;