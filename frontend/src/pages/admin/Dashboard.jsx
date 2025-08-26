import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get('/admin/agents');
        setAgents(response.data.data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <div className="space-x-4">
                  <Link to="/admin/create-agent" className="btn-primary">
                    Create Agent
                  </Link>
                  <Link to="/admin/distribute-tasks" className="btn-secondary">
                    Distribute Tasks
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Agents</h2>
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : agents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No agents found. Create your first agent!</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {agents.map((agent) => (
                    <div key={agent._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-gray-600">{agent.email}</p>
                      <p className="text-gray-600">{agent.mobileNumber}</p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Tasks Assigned: {agent.tasks?.length || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
