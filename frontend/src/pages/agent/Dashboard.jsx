import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const AgentDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [subAgents, setSubAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, subAgentsResponse] = await Promise.all([
          api.get('/agent/tasks'),
          api.get('/agent/sub-agents')
        ]);
        
        setTasks(tasksResponse.data.data);
        setSubAgents(subAgentsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <div className="space-x-4">
            <Link to="/agent/create-sub-agent" className="btn-primary">
              Create Sub-Agent
            </Link>
            <Link to="/agent/tasks" className="btn-secondary">
              Manage Tasks
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tasks Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{task.firstName}</h3>
                        <p className="text-gray-600">{task.phone}</p>
                        {task.notes && (
                          <p className="text-sm text-gray-500 mt-1">{task.notes}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-Agents Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Sub-Agents</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : subAgents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sub-agents found. Create your first sub-agent!</p>
            ) : (
              <div className="space-y-4">
                {subAgents.map((subAgent) => (
                  <div key={subAgent._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{subAgent.name}</h3>
                    <p className="text-gray-600">{subAgent.email}</p>
                    <p className="text-gray-600">{subAgent.mobileNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tasks Assigned: {subAgent.tasks?.length || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
