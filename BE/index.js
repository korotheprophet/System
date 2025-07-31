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

// A simple route to test the server
app.get('/', (req, res) => {
  res.send('IAM System Backend is running!');
});

// Auth routes
app.use('/', authRoutes);

// Protected routes
app.use('/me', meRoutes);

// Modules routes
app.get('/modules', authenticateJWT, checkPermission('Modules', 'read'), moduleRoutes);
app.post('/modules', authenticateJWT, checkPermission('Modules', 'create'), moduleRoutes);
app.put('/modules/:id', authenticateJWT, checkPermission('Modules', 'update'), moduleRoutes);
app.delete('/modules/:id', authenticateJWT, checkPermission('Modules', 'delete'), moduleRoutes);

// Permissions routes
app.get('/permissions', authenticateJWT, checkPermission('Permissions', 'read'), permissionRoutes);
app.post('/permissions', authenticateJWT, checkPermission('Permissions', 'create'), permissionRoutes);
app.put('/permissions/:id', authenticateJWT, checkPermission('Permissions', 'update'), permissionRoutes);
app.delete('/permissions/:id', authenticateJWT, checkPermission('Permissions', 'delete'), permissionRoutes);

// Roles routes
app.get('/roles', authenticateJWT, checkPermission('Roles', 'read'), roleRoutes);
app.post('/roles', authenticateJWT, checkPermission('Roles', 'create'), roleRoutes);
app.put('/roles/:id', authenticateJWT, checkPermission('Roles', 'update'), roleRoutes);
app.delete('/roles/:id', authenticateJWT, checkPermission('Roles', 'delete'), roleRoutes);

// Groups routes
app.get('/groups', authenticateJWT, checkPermission('Groups', 'read'), groupRoutes);
app.post('/groups', authenticateJWT, checkPermission('Groups', 'create'), groupRoutes);
app.put('/groups/:id', authenticateJWT, checkPermission('Groups', 'update'), groupRoutes);
app.delete('/groups/:id', authenticateJWT, checkPermission('Groups', 'delete'), groupRoutes);

// Users routes
app.get('/users', authenticateJWT, checkPermission('Users', 'read'), userRoutes);
app.post('/users', authenticateJWT, checkPermission('Users', 'create'), userRoutes);
app.put('/users/:id', authenticateJWT, checkPermission('Users', 'update'), userRoutes);
app.delete('/users/:id', authenticateJWT, checkPermission('Users', 'delete'), userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
