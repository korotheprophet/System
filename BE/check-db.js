const db = require('./database');

db.all('SELECT * FROM users', [], (err, rows) => {
  if (err) {
    console.error('Error querying users:', err.message);
    return;
  }
  
  console.log('Users in database:');
  rows.forEach(user => {
    console.log(`ID: ${user.id}, Username: ${user.username}, Password Hash: ${user.password}`);
  });
  
  db.close();
});
