const express = require('express');
const authenticateToken = require('../middleware/auth');
const {
  getFelhasznalok,
  updateFelhasznalo,
  deleteFelhasznalo,
  createFelhasznalo,
  getAdminAjanlatok,
  updateAjanlatStatus,
  deleteAdminAjanlat,
  getAdminMegrendelesek,
  updateMegrendelesStatus,
  deleteAdminMegrendeles,
  getPartnerek,
  createPartner,
  updatePartner,
  deletePartner
} = require('../controllers/adminController');
const router = express.Router();

// Felhasználók
router.get('/admin/felhasznalok', authenticateToken, getFelhasznalok);
router.put('/admin/felhasznalok/:id', authenticateToken, updateFelhasznalo);
router.delete('/admin/felhasznalok/:id', authenticateToken, deleteFelhasznalo);
router.post('/admin/felhasznalok', authenticateToken, createFelhasznalo);

// Ajánlatok
router.get('/admin/ajanlatok', authenticateToken, getAdminAjanlatok);
router.put('/admin/ajanlatok/:id/status', authenticateToken, updateAjanlatStatus);
router.delete('/admin/ajanlatok/:id', authenticateToken, deleteAdminAjanlat);

// Megrendelések
router.get('/admin/megrendelesek', authenticateToken, getAdminMegrendelesek);
router.put('/admin/megrendelesek/:id/status', authenticateToken, updateMegrendelesStatus);
router.delete('/admin/megrendelesek/:id', authenticateToken, deleteAdminMegrendeles);

// Partnerek
router.get('/admin/partnerek', authenticateToken, getPartnerek);
router.post('/admin/partnerek', authenticateToken, createPartner);
router.put('/admin/partnerek/:id', authenticateToken, updatePartner);
router.delete('/admin/partnerek/:id', authenticateToken, deletePartner);

module.exports = router;