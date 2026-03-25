const express = require('express');
const { createMegrendeles, getMegrendeleim, deleteMegrendeles } = require('../controllers/megrendelesController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/megrendelesek', authenticateToken, createMegrendeles);
router.get('/megrendeleim', authenticateToken, getMegrendeleim);
router.delete('/megrendelesek/:id', authenticateToken, deleteMegrendeles);

module.exports = router;