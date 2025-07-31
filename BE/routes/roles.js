const express = require('express');
const db = require('../database');
const router = express.Router();

// GET all roles
router.get('/', (req, res) => {
  db.all('SELECT * FROM roles', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ roles: rows });
  });
});

// POST a new role
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Role name is required' });
  }
  const stmt = db.prepare('INSERT INTO roles (name) VALUES (?)');
  stmt.run(name, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name });
  });
  stmt.finalize();
});

// PUT to update a role
router.put('/:id', (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    const stmt = db.prepare('UPDATE roles SET name = ? WHERE id = ?');
    stmt.run(name, req.params.id, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Role not found' });
      }
      res.json({ message: 'Role updated successfully' });
    });
    stmt.finalize();
  });

// DELETE a role
router.delete('/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM roles WHERE id = ?');
  stmt.run(req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  });
  stmt.finalize();
});

// POST to assign a permission to a role
router.post('/:roleId/permissions', (req, res) => {
  const { permissionId } = req.body;
  const { roleId } = req.params;

  if (!permissionId) {
    return res.status(400).json({ error: 'permissionId is required' });
  }

  const stmt = db.prepare('INSERT INTO role_permissions (roleId, permissionId) VALUES (?, ?)');
  stmt.run(roleId, permissionId, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Permission assigned to role successfully' });
  });
  stmt.finalize();
});

module.exports = router;
