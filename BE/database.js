const sqlite3 = require('sqlite3').verbose();

// Use in-memory database for simplicity
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQLite database.');
});

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Groups table
  db.run(`CREATE TABLE groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  )`);

  // Roles table
  db.run(`CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  )`);

  // Modules table
  db.run(`CREATE TABLE modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  )`);

  // Permissions table
  db.run(`CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    moduleId INTEGER,
    FOREIGN KEY (moduleId) REFERENCES modules (id) ON DELETE CASCADE,
    UNIQUE (action, moduleId)
  )`);

  // Join table for users and groups
  db.run(`CREATE TABLE group_users (
    groupId INTEGER,
    userId INTEGER,
    PRIMARY KEY (groupId, userId),
    FOREIGN KEY (groupId) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
  )`);

  // Join table for groups and roles
  db.run(`CREATE TABLE group_roles (
    groupId INTEGER,
    roleId INTEGER,
    PRIMARY KEY (groupId, roleId),
    FOREIGN KEY (groupId) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES roles (id) ON DELETE CASCADE
  )`);

  // Join table for roles and permissions
  db.run(`CREATE TABLE role_permissions (
    roleId INTEGER,
    permissionId INTEGER,
    PRIMARY KEY (roleId, permissionId),
    FOREIGN KEY (roleId) REFERENCES roles (id) ON DELETE CASCADE,
    FOREIGN KEY (permissionId) REFERENCES permissions (id) ON DELETE CASCADE
  )`);

  console.log('Database schema created.');
});

module.exports = db;
