const express = require('express');
const db = require('../database');
const router = express.Router();

// GET all groups
router.get('/', (req, res) => {
  db.all('SELECT * FROM groups', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ groups: rows });
  });
});

// POST a new group
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }
  const stmt = db.prepare('INSERT INTO groups (name) VALUES (?)');
  stmt.run(name, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name });
  });
  stmt.finalize();
});

// PUT to update a group
router.put('/:id', (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    const stmt = db.prepare('UPDATE groups SET name = ? WHERE id = ?');
    stmt.run(name, req.params.id, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Group not found' });
      }
      res.json({ message: 'Group updated successfully' });
    });
    stmt.finalize();
  });

// DELETE a group
router.delete('/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
  stmt.run(req.params.id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json({ message: 'Group deleted successfully' });
  });
  stmt.finalize();
});

// POST to assign a user to a group
router.post('/:groupId/users', (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const stmt = db.prepare('INSERT INTO group_users (groupId, userId) VALUES (?, ?)');
  stmt.run(groupId, userId, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User assigned to group successfully' });
  });
  stmt.finalize();
});

// POST to assign a role to a group
router.post('/:groupId/roles', (req, res) => {
    const { roleId } = req.body;
    const { groupId } = req.params;
  
    if (!roleId) {
      return res.status(400).json({ error: 'roleId is required' });
    }
  
    const stmt = db.prepare('INSERT INTO group_roles (groupId, roleId) VALUES (?, ?)');
    stmt.run(groupId, roleId, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Role assigned to group successfully' });
    });
    stmt.finalize();
  });

module.exports = router;
