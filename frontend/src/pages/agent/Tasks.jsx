import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AgentTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [subAgents, setSubAgents] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedSubAgents, setSelectedSubAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);

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

  const handleTaskSelect = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSubAgentSelect = (subAgentId) => {
    setSelectedSubAgents(prev =>
      prev.includes(subAgentId)
        ? prev.filter(id => id !== subAgentId)
        : [...prev, subAgentId]
    );
  };

  const handleDistribute = async () => {
    if (selectedTasks.length === 0 || selectedSubAgents.length === 0) {
      toast.error('Please select tasks and sub-agents');
      return;
    }

    setDistributing(true);
    try {
      // Calculate tasks per agent and remaining tasks
      const tasksPerAgent = Math.floor(selectedTasks.length / selectedSubAgents.length);
      const remainingTasks = selectedTasks.length % selectedSubAgents.length;
      
      // Create distribution map
      const distribution = {};
      let taskIndex = 0;
      
      selectedSubAgents.forEach((subAgentId, index) => {
        const agentTasks = [];
        // Assign base number of tasks
        for (let i = 0; i < tasksPerAgent; i++) {
          agentTasks.push(selectedTasks[taskIndex++]);
        }
        // Distribute remaining tasks sequentially
        if (index < remainingTasks) {
          agentTasks.push(selectedTasks[taskIndex++]);
        }
        distribution[subAgentId] = agentTasks;
      });

      const response = await api.post('/agent/tasks/distribute', {
        distribution: distribution
      });

      if (response.data.success) {
        toast.success('Tasks distributed successfully');
        
        // Remove distributed tasks from the current tasks list
        setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.includes(task._id)));
        
        // Clear selections
        setSelectedTasks([]);
        setSelectedSubAgents([]);
        
        // Refresh sub-agents data to show updated task counts
        try {
          const subAgentsResponse = await api.get('/agent/sub-agents');
          setSubAgents(subAgentsResponse.data.data);
        } catch (error) {
          console.error('Error refreshing sub-agents:', error);
        }
      } else {
        toast.error('Failed to distribute tasks');
      }
    } catch (error) {
      console.error('Error distributing tasks:', error);
      const errorMessage = error.response?.data?.message || 'Failed to distribute tasks. Please try again.';
      toast.error(errorMessage);
    } finally {
      setDistributing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Tasks</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tasks Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Tasks to Distribute</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks available.</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTasks.includes(task._id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => handleTaskSelect(task._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{task.firstName}</h3>
                        <p className="text-gray-600">{task.phone}</p>
                        {task.notes && (
                          <p className="text-sm text-gray-500 mt-1">{task.notes}</p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task._id)}
                        onChange={() => handleTaskSelect(task._id)}
                        className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-Agents Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Sub-Agents</h2>
            {subAgents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sub-agents available.</p>
            ) : (
              <div className="space-y-4">
                {subAgents.map((subAgent) => (
                  <div
                    key={subAgent._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSubAgents.includes(subAgent._id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => handleSubAgentSelect(subAgent._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{subAgent.name}</h3>
                        <p className="text-gray-600">{subAgent.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Current Tasks: {subAgent.tasks?.length || 0}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedSubAgents.includes(subAgent._id)}
                        onChange={() => handleSubAgentSelect(subAgent._id)}
                        className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/agent')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDistribute}
            disabled={distributing || selectedTasks.length === 0 || selectedSubAgents.length === 0}
            className="btn-primary"
          >
            {distributing ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              'Distribute Tasks'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentTasks;
