import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [newPermission, setNewPermission] = useState({ action: '', moduleId: '' });
  const [actions] = useState(['create', 'read', 'update', 'delete']);

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
    fetchModules();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.permissions);
    } catch (err) {
      setError('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.roles);
    } catch (err) {
      setError('Failed to fetch roles');
    }
  };

  const fetchModules = async () => {
    try {
      const response = await api.get('/modules');
      setModules(response.data.modules);
    } catch (err) {
      setError('Failed to fetch modules');
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    try {
      await api.post('/permissions', newPermission);
      fetchPermissions();
      setShowAddModal(false);
      setNewPermission({ action: '', moduleId: '' });
    } catch (err) {
      setError('Failed to add permission');
    }
  };

  const handleDeletePermission = async (id) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await api.delete(`/permissions/${id}`);
        fetchPermissions();
      } catch (err) {
        setError('Failed to delete permission');
      }
    }
  };

  const getPermissionRoles = (permissionId) => {
    // This is a simplified way to get roles for a permission
    // In a real app, you would have a dedicated endpoint for this
    return roles.filter(role => 
      role.permissions && role.permissions.some(p => p.id === permissionId)
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Permissions</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Permission
      </button>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Module
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {permission.action}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {permission.moduleName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex flex-wrap gap-1">
                  {getPermissionRoles(permission.id).map((role) => (
                    <span key={role.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {role.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleDeletePermission(permission.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Permission</h2>
            <form onSubmit={handleAddPermission}>
              <div className="mb-4">
                <label htmlFor="action" className="block text-gray-700 text-sm font-bold mb-2">
                  Action
                </label>
                <select
                  id="action"
                  value={newPermission.action}
                  onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Action</option>
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label htmlFor="moduleId" className="block text-gray-700 text-sm font-bold mb-2">
                  Module
                </label>
                <select
                  id="moduleId"
                  value={newPermission.moduleId}
                  onChange={(e) => setNewPermission({ ...newPermission, moduleId: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Module</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
