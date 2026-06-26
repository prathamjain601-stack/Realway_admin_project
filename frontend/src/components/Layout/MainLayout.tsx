import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AdminChat from '../Chat/AdminChat';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';

const MainLayout = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  useEffect(() => {
    if (token) {
      connect(token);
    }
    return () => disconnect();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {/* Admin Chat — only for Admin/Manager */}
      {user && (user.role === 'Admin' || user.role === 'Manager') && <AdminChat />}
    </div>
  );
};

export default MainLayout;
