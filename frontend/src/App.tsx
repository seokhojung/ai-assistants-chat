import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AgentChat from './pages/AgentChat';
import FileManager from './pages/FileManager';
import ComponentShowcase from './components/ui/ComponentShowcase';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ui';

function App() {
  return (
    <ToastProvider>
      <Router>
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat/:agentType" element={<AgentChat />} />
            <Route path="files" element={<FileManager />} />
            <Route path="components" element={<ComponentShowcase />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App; 