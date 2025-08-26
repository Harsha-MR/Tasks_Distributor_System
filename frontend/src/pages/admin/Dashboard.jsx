import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentTasks, setAgentTasks] = useState([]);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const { user } = useAuth();

  const handleAgentClick = async (agent) => {
    setSelectedAgent(agent);
    try {
      const response = await api.get(`/admin/agents/${agent._id}/tasks`);
      setAgentTasks(response.data.data);
      setShowTasksModal(true);
    } catch (error) {
      console.error('Error fetching agent tasks:', error);
      toast.error(error.response?.data?.message || 'Error fetching tasks');
      setShowTasksModal(false);
    }
  };

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
                    <div 
                      key={agent._id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleAgentClick(agent)}
                    >
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

      {/* Tasks Modal */}
      {showTasksModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tasks Assigned to {selectedAgent.name}</h2>
              <button
                onClick={() => setShowTasksModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              {agentTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks assigned yet.</p>
              ) : (
                <div className="space-y-4">
                  {agentTasks.map((task) => (
                    <div key={task._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Name: {task.firstName}</h3>
                          <p className="text-gray-600">Phone: {task.phone}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Notes:</span> {task.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
