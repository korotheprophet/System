const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect directly to the database
const dbPath = path.join(__dirname, 'iam.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM users', [], (err, rows) => {
  if (err) {
    console.error('Error querying users:', err.message);
    return;
  }
  
  console.log('Users in database:');
  rows.forEach(user => {
    console.log(`ID: ${user.id}, Username: ${user.username}`);
    console.log(`Password Hash: ${user.password.substring(0, 20)}...`); // Show only first 20 chars for security
    console.log('---');
  });
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});
