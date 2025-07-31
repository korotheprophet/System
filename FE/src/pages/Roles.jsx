import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({ name: '' });
  const [editRole, setEditRole] = useState({ name: '' });
  const [roleGroups, setRoleGroups] = useState({});
  const [availableGroups, setAvailableGroups] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchGroups();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.roles);
      // Initialize roleGroups state
      const initialRoleGroups = {};
      response.data.roles.forEach(role => {
        initialRoleGroups[role.id] = [];
      });
      setRoleGroups(initialRoleGroups);
    } catch (err) {
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups);
    } catch (err) {
      setError('Failed to fetch groups');
    }
  };

  const fetchRoleGroups = async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}/groups`);
      setRoleGroups(prev => ({
        ...prev,
        [roleId]: response.data.groups
      }));
    } catch (err) {
      setError('Failed to fetch role groups');
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      await api.post('/roles', newRole);
      fetchRoles();
      setShowAddModal(false);
      setNewRole({ name: '' });
    } catch (err) {
      setError('Failed to add role');
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/roles/${selectedRole.id}`, editRole);
      fetchRoles();
      setShowEditModal(false);
      setSelectedRole(null);
      setEditRole({ name: '' });
    } catch (err) {
      setError('Failed to edit role');
    }
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await api.delete(`/roles/${id}`);
        fetchRoles();
      } catch (err) {
        setError('Failed to delete role');
      }
    }
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setEditRole({ name: role.name });
    setShowEditModal(true);
  };

  const handleAssignGroupToRole = async (roleId, groupId) => {
    try {
      await api.post(`/roles/${roleId}/groups`, { groupId });
      fetchRoleGroups(roleId);
    } catch (err) {
      setError('Failed to assign group to role');
    }
  };

  const handleRemoveGroupFromRole = async (roleId, groupId) => {
    // This would require a custom endpoint to remove a group from a role
    // For now, we'll just refetch the role groups
    try {
      // In a real app, you would have a DELETE endpoint for this
      // await api.delete(`/roles/${roleId}/groups/${groupId}`);
      fetchRoleGroups(roleId);
    } catch (err) {
      setError('Failed to remove group from role');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Roles</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Role
      </button>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Groups
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {role.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => handleAssignGroupToRole(role.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="">Add Group</option>
                    {groups
                      .filter(group => !roleGroups[role.id]?.some(rg => rg.id === group.id))
                      .map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                  </select>
                  <div className="flex flex-wrap gap-1">
                    {roleGroups[role.id]?.map((group) => (
                      <span key={group.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {group.name}
                        <button
                          onClick={() => handleRemoveGroupFromRole(role.id, group.id)}
                          className="ml-1 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => openEditModal(role)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
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
            <h2 className="text-xl font-bold mb-4">Add Role</h2>
            <form onSubmit={handleAddRole}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
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

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Role</h2>
            <form onSubmit={handleEditRole}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editRole.name}
                  onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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

export default Roles;
