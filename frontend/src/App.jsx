import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AgentDashboard from './pages/agent/Dashboard';
import CreateAgent from './pages/admin/CreateAgent';
import DistributeTasks from './pages/admin/DistributeTasks';
import CreateSubAgent from './pages/agent/CreateSubAgent';
import AgentTasks from './pages/agent/Tasks';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/create-agent"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <CreateAgent />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/distribute-tasks"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <DistributeTasks />
                </PrivateRoute>
              }
            />

            {/* Agent Routes */}
            <Route
              path="/agent"
              element={
                <PrivateRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/create-sub-agent"
              element={
                <PrivateRoute allowedRoles={['agent']}>
                  <CreateSubAgent />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/tasks"
              element={
                <PrivateRoute allowedRoles={['agent']}>
                  <AgentTasks />
                </PrivateRoute>
              }
            />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
