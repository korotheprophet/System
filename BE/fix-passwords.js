const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Connect directly to the database without using your database.js file
const dbPath = path.join(__dirname, 'iam.db');
const db = new sqlite3.Database(dbPath);

const users = [
  { username: 'admin', password: 'password' },
  { username: 'editor', password: 'password' },
  { username: 'viewer', password: 'password' }
];

console.log('Updating user passwords...');

users.forEach((user, index) => {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  
  db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, user.username], function(err) {
    if (err) {
      console.error(`Error updating password for ${user.username}:`, err.message);
    } else {
      console.log(`Password updated for ${user.username} (${this.changes} rows affected)`);
    }
    
    // Close the database after the last update
    if (index === users.length - 1) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  });
});
