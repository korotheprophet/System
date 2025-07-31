const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// POST /register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run(username, hashedPassword, function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Error registering user', error: err.message });
    }
    res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
  });
  stmt.finalize();
});

// POST /login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for username:', username); // DEBUG LOG
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Database error during login:', err.message); // DEBUG LOG
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    console.log('User found in DB:', user); // DEBUG LOG
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log('Password valid?', isPasswordValid); // DEBUG LOG
    console.log('Plain password:', password); // DEBUG LOG
    console.log('Hashed password from DB:', user.password); // DEBUG LOG
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'Login successful', token });
  });
});

module.exports = router;