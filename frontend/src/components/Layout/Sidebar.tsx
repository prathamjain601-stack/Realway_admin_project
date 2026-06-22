import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Activity, Bell, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/', roles: ['Admin', 'Manager', 'User'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['Admin', 'Manager'] },
    { icon: FileText, label: 'Content', path: '/content', roles: ['Admin', 'Manager'] },
    { icon: Activity, label: 'System Metrics', path: '/metrics', roles: ['Admin', 'Manager'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['Admin'] },
  ];

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'User')
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="font-bold text-white text-xl">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Aura Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-500/10 text-primary-500'
                : 'text-gray-400 hover:bg-dark-border/50 hover:text-gray-200'
            )}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border space-y-2">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-sm font-semibold">
            {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
            </p>
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-gray-500" />
              <p className="text-[11px] text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
