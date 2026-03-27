const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ajanlatRoutes = require('./routes/ajanlatRoutes');
const megrendelesRoutes = require('./routes/megrendelesRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 BetonLogisztika API fut!');
});

app.use('/api', authRoutes);
app.use('/api', ajanlatRoutes);
app.use('/api', megrendelesRoutes);
app.use('/api', partnerRoutes);
app.use('/api', adminRoutes);

module.exports = app;