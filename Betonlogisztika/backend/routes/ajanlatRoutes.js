const express = require('express');
const { createAjanlat, getAjanlataim, deleteAjanlat } = require('../controllers/ajanlatController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/ajanlatok', authenticateToken, createAjanlat);
router.get('/ajanlataim', authenticateToken, getAjanlataim);
router.delete('/ajanlatok/:id', authenticateToken, deleteAjanlat);

module.exports = router;