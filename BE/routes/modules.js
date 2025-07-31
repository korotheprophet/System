const express = require('express');
const db = require('../database');
const router = express.Router();

// GET all modules
router.get('/', (req, res) => {
  db.all('SELECT * FROM modules', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ modules: rows });
  });
});

// POST a new module
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Module name is required' });
  }
  const stmt = db.prepare('INSERT INTO modules (name) VALUES (?)');
  stmt.run(name, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name });
  });
  stmt.finalize();
});

// PUT to update a module
router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Module name is required' });
  }
  const stmt = db.prepare('UPDATE modules SET name = ? WHERE id = ?');
  stmt.run(name, req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json({ message: 'Module updated successfully' });
  });
  stmt.finalize();
});

// DELETE a module
router.delete('/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM modules WHERE id = ?');
  stmt.run(req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json({ message: 'Module deleted successfully' });
  });
  stmt.finalize();
});

module.exports = router;
