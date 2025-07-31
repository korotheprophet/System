const db = require('../database');

const checkPermission = (moduleName, action) => {
  return (req, res, next) => {
    const userId = req.user.id;

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
      if (row.count > 0) {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
      }
    });
  };
};

module.exports = checkPermission;
