const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword } = require('../utils/helpers');

const register = async (req, res) => {
  try {
    const { nev, email, jelszo, cegnev, telefon } = req.body;

    if (!nev || !email || !jelszo || !telefon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Minden kötelező mezőt ki kell tölteni!' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Érvénytelen email formátum!' 
      });
    }

    if (!validatePassword(jelszo)) {
      return res.status(400).json({ 
        success: false, 
        message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie!' 
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ez az email cím már regisztrálva van!' 
      });
    }

    const userId = await User.create({ nev, email, jelszo, cegnev, telefon });

    const token = jwt.sign(
      { id: userId, email: email, jogosultsag: 'user' },
      process.env.JWT_SECRET || 'titkos_kod_valtoztasd_meg',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Sikeres regisztráció!',
      token,
      user: {
        id: userId,
        nev,
        email,
        cegnev: cegnev || null,
        telefon,
        jogosultsag: 'user'
      }
    });

  } catch (error) {
    console.error('❌ Regisztrációs hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

const login = async (req, res) => {
  try {
    const { email, jelszo } = req.body;

    if (!email || !jelszo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email és jelszó megadása kötelező!' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Hibás email vagy jelszó!' 
      });
    }

    const validPassword = await User.verifyPassword(user, jelszo);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Hibás email vagy jelszó!' 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, jogosultsag: user.jogosultsag || 'user' },
      process.env.JWT_SECRET || 'titkos_kod_valtoztasd_meg',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Sikeres bejelentkezés!',
      token,
      user: {
        id: user.id,
        nev: user.nev,
        email: user.email,
        cegnev: user.cegnev,
        telefon: user.telefon,
        jogosultsag: user.jogosultsag || 'user'
      }
    });

  } catch (error) {
    console.error('❌ Bejelentkezési hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

module.exports = { register, login };