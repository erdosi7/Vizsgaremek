const Partner = require('../models/Partner');

const getPartnerek = async (req, res) => {
  try {
    const partnerek = await Partner.findAll();
    res.json({ success: true, partnerek });
  } catch (error) {
    console.error('❌ Partnerek lekérési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

module.exports = { getPartnerek };