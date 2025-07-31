const express = require('express');
const db = require('../database');
const authenticateJWT = require('../middleware/auth');
const router = express.Router();

// GET current user's inherited permissions
router.get('/permissions', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT DISTINCT p.action, m.name as moduleName
    FROM permissions p
    JOIN modules m ON p.moduleId = m.id
    JOIN role_permissions rp ON p.id = rp.permissionId
    JOIN group_roles gr ON rp.roleId = gr.roleId
    JOIN group_users gu ON gr.groupId = gu.groupId
    WHERE gu.userId = ?
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ permissions: rows });
  });
});

// POST to simulate an action
router.post('/simulate-action', authenticateJWT, (req, res) => {
    const { moduleName, action } = req.body;
    const userId = req.user.id;
  
    if (!moduleName || !action) {
      return res.status(400).json({ error: 'moduleName and action are required' });
    }
  
    const sql = `
      SELECT COUNT(*) as count
      FROM permissions p
      JOIN modules m ON p.moduleId = m.id
      JOIN role_permissions rp ON p.id = rp.permissionId
      JOIN group_roles gr ON rp.roleId = gr.roleId
      JOIN group_users gu ON gr.groupId = gu.groupId
      WHERE gu.userId = ? AND m.name = ? AND p.action = ?
    `;
  
    db.get(sql, [userId, moduleName, action], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const canPerformAction = row.count > 0;
      res.json({ canPerformAction });
    });
  });

module.exports = router;
