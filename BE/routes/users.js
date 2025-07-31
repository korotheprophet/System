const express = require('express');
const db = require('../database');
const router = express.Router();

// GET all users
router.get('/', (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// GET a single user by id
router.get('/:id', (req, res) => {
    db.get('SELECT id, username FROM users WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user: row });
    });
  });

// GET groups for a specific user
router.get('/:id/groups', (req, res) => {
    const sql = `
      SELECT g.id, g.name
      FROM groups g
      JOIN group_users gu ON g.id = gu.groupId
      WHERE gu.userId = ?
    `;
    db.all(sql, [req.params.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ groups: rows });
    });
  });

// PUT to update a user (e.g., change username)
router.put('/:id', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const stmt = db.prepare('UPDATE users SET username = ? WHERE id = ?');
  stmt.run(username, req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
  stmt.finalize();
});

// DELETE a user
router.delete('/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
  stmt.finalize();
});

module.exports = router;
