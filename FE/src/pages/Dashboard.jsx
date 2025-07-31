import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import api from '../api/axios';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('read');
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useSelector((state) => state.auth);

  const actions = ['create', 'read', 'update', 'delete'];

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await api.get('/me/permissions');
        setPermissions(response.data.permissions);
      } catch (err) {
        setError('Failed to fetch permissions');
      } finally {
        setLoading(false);
      }
    };

    const fetchModules = async () => {
      try {
        const response = await api.get('/modules');
        setModules(response.data.modules);
        if (response.data.modules.length > 0) {
          setSelectedModule(response.data.modules[0].name);
        }
      } catch (err) {
        setError('Failed to fetch modules');
      }
    };

    fetchPermissions();
    fetchModules();
  }, []);

  const handleSimulateAction = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/me/simulate-action', {
        moduleName: selectedModule,
        action: selectedAction,
      });
      setSimulationResult(response.data.canPerformAction);
    } catch (err) {
      setError('Failed to simulate action');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => dispatch(logout())}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user && <p className="mb-4">Welcome, <strong>{user.username}</strong>!</p>}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Permissions</h2>
        {loading ? (
          <p>Loading permissions...</p>
        ) : permissions.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permission.moduleName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permission.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no permissions.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Simulate Action</h2>
        <form onSubmit={handleSimulateAction} className="space-y-4">
          <div>
            <label htmlFor="module" className="block text-sm font-medium text-gray-700">
              Module
            </label>
            <select
              id="module"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {modules.map((module) => (
                <option key={module.id} value={module.name}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700">
              Action
            </label>
            <select
              id="action"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Simulate
          </button>
        </form>
        {simulationResult !== null && (
          <p className="mt-4">
            Result: <strong>{simulationResult ? 'Allowed' : 'Forbidden'}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
