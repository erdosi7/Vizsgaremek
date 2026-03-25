const express = require('express');
const { getPartnerek } = require('../controllers/partnerController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/partnerek', authenticateToken, getPartnerek);

module.exports = router;