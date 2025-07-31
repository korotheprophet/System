require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database.js'); // Import the database connection
const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const permissionRoutes = require('./routes/permissions');
const roleRoutes = require('./routes/roles');
const groupRoutes = require('./routes/groups');
const userRoutes = require('./routes/users');
const meRoutes = require('./routes/me');
const authenticateJWT = require('./middleware/auth');
const checkPermission = require('./middleware/permissions');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database with seed data
db.serialize(() => {
  const seedScript = require('./seed.js');
  seedScript.run(); // Call the run function to execute seeding
  console.log('Database initialized with seed data');
});

// A simple route to test the server
app.get('/', (req, res) => {
  res.send('IAM System Backend is running!');
});

// Auth routes (no authentication required)
app.use('/api', authRoutes);

// Protected routes
app.use('/api/me', authenticateJWT, meRoutes);

// API routes with authentication and permissions
app.use('/api/modules', authenticateJWT, checkPermission('Modules', 'read'), moduleRoutes);
app.use('/api/permissions', authenticateJWT, checkPermission('Permissions', 'read'), permissionRoutes);
app.use('/api/roles', authenticateJWT, checkPermission('Roles', 'read'), roleRoutes);
app.use('/api/groups', authenticateJWT, checkPermission('Groups', 'read'), groupRoutes);
app.use('/api/users', authenticateJWT, checkPermission('Users', 'read'), userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
