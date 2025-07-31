const express = require('express');
const db = require('../database');
const router = express.Router();

// GET all permissions
router.get('/', (req, res) => {
  const sql = `
    SELECT p.id, p.action, p.moduleId, m.name as moduleName
    FROM permissions p
    JOIN modules m ON p.moduleId = m.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ permissions: rows });
  });
});

// POST a new permission
router.post('/', (req, res) => {
  const { action, moduleId } = req.body;
  if (!action || !moduleId) {
    return res.status(400).json({ error: 'Action and moduleId are required' });
  }
  const stmt = db.prepare('INSERT INTO permissions (action, moduleId) VALUES (?, ?)');
  stmt.run(action, moduleId, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, action, moduleId });
  });
  stmt.finalize();
});

// DELETE a permission
router.delete('/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM permissions WHERE id = ?');
  stmt.run(req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    res.json({ message: 'Permission deleted successfully' });
  });
  stmt.finalize();
});

module.exports = router;
