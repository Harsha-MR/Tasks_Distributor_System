import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const DistributeTasks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file extension
      const extension = file.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(extension)) {
        toast.error('Please upload a CSV, XLSX, or XLS file');
        fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const [agents, setAgents] = useState([]);
  const [parsedTasks, setParsedTasks] = useState([]);

  // Fetch agents when component mounts
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get('/admin/agents');
        setAgents(response.data.data);
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast.error('Failed to fetch agents');
      }
    };
    fetchAgents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    // Validate file extension again
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension)) {
      toast.error('Please upload a CSV, XLSX, or XLS file');
      return;
    }

    setLoading(true);

    try {
      // Upload file and distribute tasks in one request
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('agentIds', JSON.stringify(agents.map(agent => agent._id)));
      
      const response = await api.post('/admin/tasks/distribute', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      toast.success(
        `Tasks distributed successfully! ${response.data.data.totalTasks} tasks distributed among agents.`
      );
      
      // Show distribution details
      response.data.data.distribution.forEach(({ agentId, tasksAssigned }) => {
        const agent = agents.find(a => a._id === agentId);
        toast.success(`${agent?.name || 'Agent'}: ${tasksAssigned} tasks assigned`);
      });

      setTimeout(() => {
        navigate('/admin');
      }, 2000); // Give time for toasts to be read
    } catch (error) {
      console.error('Error distributing tasks:', error);
      toast.error(error.response?.data?.message || 'Error distributing tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Distribute Tasks</h1>
          
          {agents.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No agents available. Please create agents first before distributing tasks.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    {agents.length} agents available for task distribution
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">
                Upload CSV File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90">
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV, XLSX, or XLS up to 5MB</p>
                </div>
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="btn-primary"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  'Distribute Tasks'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default DistributeTasks;
