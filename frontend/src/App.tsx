import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import AgentChat from './pages/AgentChat';
import Login from './pages/Login';
import FileManager from './pages/FileManager';
import ProtectedRoute from './components/ProtectedRoute';

const App: FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="chat/:agentType" element={<AgentChat />} />
          <Route path="files" element={<FileManager />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App; 