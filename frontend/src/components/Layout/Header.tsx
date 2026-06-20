import React from 'react';
import { Bell, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Header = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-dark-border bg-dark-bg/95 backdrop-blur-sm z-10">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Dashboard
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-dark-card transition-colors relative">
          <Bell size={20} className="text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <UserCircle size={32} className="text-primary-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;
