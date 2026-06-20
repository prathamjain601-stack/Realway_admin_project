import React, { useEffect, useState } from 'react';
import MetricsWidget from './MetricsWidget';
import { Users, FileText, Activity, Server, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/useAuthStore';

const dummyChartData = [
  { name: 'Mon', users: 4000 },
  { name: 'Tue', users: 3000 },
  { name: 'Wed', users: 5000 },
  { name: 'Thu', users: 4500 },
  { name: 'Fri', users: 6000 },
  { name: 'Sat', users: 5500 },
  { name: 'Sun', users: 7000 },
];

const Dashboard = () => {
  const [liveUsers, setLiveUsers] = useState(0);
  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Connect to Socket.io for Real-Time Sync
    const socket: Socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to real-time metrics stream');
    });

    socket.on('metrics:users', (data: { count: number }) => {
      setLiveUsers(data.count);
    });

    socket.on('alert:system', (data: { message: string }) => {
      setSystemAlerts((prev) => [data.message, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-card rounded-full border border-dark-border">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-green-400">Live Sync Active</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsWidget 
          title="Active Live Users" 
          value={liveUsers} 
          icon={Activity} 
          colorClass="bg-green-500 text-green-500"
        />
        <MetricsWidget 
          title="Total Registered Users" 
          value="10,482" 
          icon={Users} 
          trend={{ value: '12%', isPositive: true }}
          colorClass="bg-primary-500 text-primary-500"
        />
        <MetricsWidget 
          title="Published Posts" 
          value="1,204" 
          icon={FileText} 
          trend={{ value: '4%', isPositive: true }}
          colorClass="bg-purple-500 text-purple-500"
        />
        <MetricsWidget 
          title="Server Load" 
          value="42%" 
          icon={Server} 
          trend={{ value: '8%', isPositive: false }}
          colorClass="bg-red-500 text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-6">User Growth (7 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyChartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">Live System Alerts</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {systemAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm space-y-3">
                <Bell size={32} className="opacity-20" />
                <p>No alerts detected.</p>
              </div>
            ) : (
              systemAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-dark-bg/50 border border-dark-border animate-in slide-in-from-right-4">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-300">{alert}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
