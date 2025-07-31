const db = require('./database');
const bcrypt = require('bcryptjs');

// Function to run the seed script
function run() {
  // Seed data
const modules = [
  { name: 'Users' },
  { name: 'Groups' },
  { name: 'Roles' },
  { name: 'Modules' },
  { name: 'Permissions' },
];

const roles = [
  { name: 'Admin' },
  { name: 'Editor' },
  { name: 'Viewer' },
];

const permissions = [
  { action: 'create', moduleId: 1 },
  { action: 'read', moduleId: 1 },
  { action: 'update', moduleId: 1 },
  { action: 'delete', moduleId: 1 },
  { action: 'create', moduleId: 2 },
  { action: 'read', moduleId: 2 },
  { action: 'update', moduleId: 2 },
  { action: 'delete', moduleId: 2 },
  { action: 'create', moduleId: 3 },
  { action: 'read', moduleId: 3 },
  { action: 'update', moduleId: 3 },
  { action: 'delete', moduleId: 3 },
  { action: 'create', moduleId: 4 },
  { action: 'read', moduleId: 4 },
  { action: 'update', moduleId: 4 },
  { action: 'delete', moduleId: 4 },
  { action: 'create', moduleId: 5 },
  { action: 'read', moduleId: 5 },
  { action: 'update', moduleId: 5 },
  { action: 'delete', moduleId: 5 },
];

const groups = [
  { name: 'Administrators' },
  { name: 'Editors' },
  { name: 'Viewers' },
];

const users = [
  { username: 'admin', password: 'password' },
  { username: 'editor', password: 'password' },
  { username: 'viewer', password: 'password' },
];

// Function to seed users with hashed passwords
function seedUsers() {
  const stmt = db.prepare('INSERT OR REPLACE INTO users (username, password) VALUES (?, ?)');
  
  users.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    stmt.run(user.username, hashedPassword);
  });
  
  stmt.finalize();
  console.log('Users seeded successfully');
}

// Function to seed roles
function seedRoles() {
  const stmt = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
  
  roles.forEach(role => {
    stmt.run(role.name);
  });
  
  stmt.finalize();
  console.log('Roles seeded successfully');
}

// Seed the database
console.log('Starting database seeding...'); // DEBUG LOG
db.serialize(() => {
  // Insert modules
  console.log('Inserting modules...'); // DEBUG LOG
  const moduleStmt = db.prepare('INSERT OR IGNORE INTO modules (name) VALUES (?)');
  modules.forEach(module => {
    moduleStmt.run(module.name);
  });
  moduleStmt.finalize();
  console.log('Modules inserted.'); // DEBUG LOG

  // Seed roles
  seedRoles();

  // Insert permissions
  console.log('Inserting permissions...'); // DEBUG LOG
  const permissionStmt = db.prepare('INSERT OR IGNORE INTO permissions (action, moduleId) VALUES (?, ?)');
  permissions.forEach(permission => {
    permissionStmt.run(permission.action, permission.moduleId);
  });
  permissionStmt.finalize();
  console.log('Permissions inserted.'); // DEBUG LOG

  // Insert groups
  console.log('Inserting groups...'); // DEBUG LOG
  const groupStmt = db.prepare('INSERT OR IGNORE INTO groups (name) VALUES (?)');
  groups.forEach(group => {
    groupStmt.run(group.name);
  });
  groupStmt.finalize();
  console.log('Groups inserted.'); // DEBUG LOG

  // Seed users
  seedUsers();

  // Assign roles to groups
  console.log('Assigning roles to groups...'); // DEBUG LOG
  const groupRoleStmt = db.prepare('INSERT OR REPLACE INTO group_roles (groupId, roleId) VALUES (?, ?)');
  // Admin role to Administrators group
  groupRoleStmt.run(1, 1);
  // Editor role to Editors group
  groupRoleStmt.run(2, 2);
  // Viewer role to Viewers group
  groupRoleStmt.run(3, 3);
  groupRoleStmt.finalize();
  console.log('Roles assigned to groups.'); // DEBUG LOG

  // Assign permissions to roles
  console.log('Assigning permissions to roles...'); // DEBUG LOG
  const rolePermissionStmt = db.prepare('INSERT OR REPLACE INTO role_permissions (roleId, permissionId) VALUES (?, ?)');
  // Admin role gets all permissions
  for (let i = 1; i <= 20; i++) {
    rolePermissionStmt.run(1, i);
  }
  // Editor role gets create, read, update permissions
  for (let i = 1; i <= 12; i++) {
    rolePermissionStmt.run(2, i);
  }
  // Viewer role gets read permissions
  for (let i = 2; i <= 20; i += 4) {
    rolePermissionStmt.run(3, i);
  }
  rolePermissionStmt.finalize();
  console.log('Permissions assigned to roles.'); // DEBUG LOG

  // Assign users to groups
  console.log('Assigning users to groups...'); // DEBUG LOG
  const groupUserStmt = db.prepare('INSERT OR REPLACE INTO group_users (groupId, userId) VALUES (?, ?)');
  // Admin user to Administrators group
  groupUserStmt.run(1, 1);
  // Editor user to Editors group
  groupUserStmt.run(2, 2);
  // Viewer user to Viewers group
  groupUserStmt.run(3, 3);
  groupUserStmt.finalize();
  console.log('Users assigned to groups.'); // DEBUG LOG

  console.log('Database seeded successfully.');
});
}

module.exports = { run };
