import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ContentView from './components/Content/ContentView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<div className="glass-panel p-6 rounded-xl">Users Management</div>} />
          <Route path="content" element={<ContentView />} />
          <Route path="metrics" element={<div className="glass-panel p-6 rounded-xl">System Metrics</div>} />
          <Route path="settings" element={<div className="glass-panel p-6 rounded-xl">Settings</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
