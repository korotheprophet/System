import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '' });
  const [editGroup, setEditGroup] = useState({ name: '' });
  const [groupUsers, setGroupUsers] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups);
      // Initialize groupUsers state
      const initialGroupUsers = {};
      response.data.groups.forEach(group => {
        initialGroupUsers[group.id] = [];
      });
      setGroupUsers(initialGroupUsers);
    } catch (err) {
      setError('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchGroupUsers = async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/users`);
      setGroupUsers(prev => ({
        ...prev,
        [groupId]: response.data.groups
      }));
    } catch (err) {
      setError('Failed to fetch group users');
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', newGroup);
      fetchGroups();
      setShowAddModal(false);
      setNewGroup({ name: '' });
    } catch (err) {
      setError('Failed to add group');
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/groups/${selectedGroup.id}`, editGroup);
      fetchGroups();
      setShowEditModal(false);
      setSelectedGroup(null);
      setEditGroup({ name: '' });
    } catch (err) {
      setError('Failed to edit group');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await api.delete(`/groups/${id}`);
        fetchGroups();
      } catch (err) {
        setError('Failed to delete group');
      }
    }
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setEditGroup({ name: group.name });
    setShowEditModal(true);
  };

  const handleAssignUserToGroup = async (groupId, userId) => {
    try {
      await api.post(`/groups/${groupId}/users`, { userId });
      fetchGroupUsers(groupId);
    } catch (err) {
      setError('Failed to assign user to group');
    }
  };

  const handleRemoveUserFromGroup = async (groupId, userId) => {
    // This would require a custom endpoint to remove a user from a group
    // For now, we'll just refetch the group users
    try {
      // In a real app, you would have a DELETE endpoint for this
      // await api.delete(`/groups/${groupId}/users/${userId}`);
      fetchGroupUsers(groupId);
    } catch (err) {
      setError('Failed to remove user from group');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Groups</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Group
      </button>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Users
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groups.map((group) => (
            <tr key={group.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {group.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => handleAssignUserToGroup(group.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="">Add User</option>
                    {users
                      .filter(user => !groupUsers[group.id]?.some(gu => gu.id === user.id))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                  </select>
                  <div className="flex flex-wrap gap-1">
                    {groupUsers[group.id]?.map((user) => (
                      <span key={user.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {user.username}
                        <button
                          onClick={() => handleRemoveUserFromGroup(group.id, user.id)}
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
                  onClick={() => openEditModal(group)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
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
            <h2 className="text-xl font-bold mb-4">Add Group</h2>
            <form onSubmit={handleAddGroup}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
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
            <h2 className="text-xl font-bold mb-4">Edit Group</h2>
            <form onSubmit={handleEditGroup}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editGroup.name}
                  onChange={(e) => setEditGroup({ ...editGroup, name: e.target.value })}
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

export default Groups;
