const bcrypt = require('bcryptjs');

const plainPassword = 'password';
const hashedPassword = bcrypt.hashSync(plainPassword, 10);

console.log('Plain password:', plainPassword);
console.log('Hashed password:', hashedPassword);
console.log('Comparison result:', bcrypt.compareSync(plainPassword, hashedPassword));

// Test with a known hash
const testHash = '$2a$10$example'; // Replace with actual hash from your DB
console.log('Test comparison:', bcrypt.compareSync('password', testHash));
