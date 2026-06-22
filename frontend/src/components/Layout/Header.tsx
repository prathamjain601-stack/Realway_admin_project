import React from 'react';
import { UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import NotificationPanel from '../Notifications/NotificationPanel';

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
        <NotificationPanel />
        <div className="flex items-center space-x-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email}
            </p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold">
            {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
