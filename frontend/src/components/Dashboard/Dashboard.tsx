import React, { useEffect, useState } from 'react';
import MetricsWidget from './MetricsWidget';
import { Users, FileText, Activity, Server, TrendingUp, Download, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSocketStore } from '../../store/useSocketStore';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

interface DashboardMetrics {
  users: { total: number; active: number; new24h: number; new7d: number; new30d: number };
  posts: { total: number; published: number; drafts: number };
}

interface ActivityItem {
  id: number;
  action: string;
  entityType: string;
  createdAt: string;
  user?: { email: string; firstName: string; lastName: string } | null;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [timeRange, setTimeRange] = useState('7');
  const [loading, setLoading] = useState(true);
  const liveUsers = useSocketStore((s) => s.liveUsers);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [metricsRes, growthRes, activityRes] = await Promise.all([
          api.get('/metrics/dashboard'),
          api.get(`/metrics/user-growth?days=${timeRange}`),
          api.get('/metrics/recent-activity?limit=10'),
        ]);
        setMetrics(metricsRes.data);
        setGrowthData(growthRes.data.map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: parseInt(d.count),
        })));
        setActivity(activityRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [timeRange]);

  const handleExport = async () => {
    try {
      const response = await api.get('/metrics/export?format=csv&days=30', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `metrics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed');
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      USER_LOGIN: 'logged in',
      USER_LOGOUT: 'logged out',
      USER_REGISTER: 'registered',
      CREATE_POST: 'created a post',
      UPDATE_POST: 'updated a post',
      DELETE_POST: 'deleted a post',
      DELETE_USER: 'deleted a user',
      CHANGE_PASSWORD: 'changed password',
      BULK_IMPORT: 'bulk imported users',
    };
    return labels[action] || action;
  };

  const getActionDot = (action: string) => {
    if (action.includes('DELETE') || action.includes('banned')) return 'bg-red-500';
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'bg-green-500';
    if (action.includes('LOGIN')) return 'bg-blue-500';
    return 'bg-primary-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary-500/50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-card rounded-full border border-dark-border">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-400">Live Sync Active</span>
          </div>
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
          title="Total Users"
          value={metrics?.users.total?.toLocaleString() || '—'}
          icon={Users}
          trend={metrics?.users.new7d ? { value: `+${metrics.users.new7d} this week`, isPositive: true } : undefined}
          colorClass="bg-primary-500 text-primary-500"
        />
        <MetricsWidget
          title="Published Posts"
          value={metrics?.posts.published?.toLocaleString() || '—'}
          icon={FileText}
          trend={metrics?.posts.drafts ? { value: `${metrics.posts.drafts} drafts`, isPositive: true } : undefined}
          colorClass="bg-purple-500 text-purple-500"
        />
        <MetricsWidget
          title="New Signups (24h)"
          value={metrics?.users.new24h || 0}
          icon={TrendingUp}
          trend={metrics?.users.new30d ? { value: `${metrics.users.new30d} this month`, isPositive: true } : undefined}
          colorClass="bg-amber-500 text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">User Growth</h2>
            <div className="flex gap-1 bg-dark-bg/50 rounded-lg p-1">
              {[{ v: '7', l: '7D' }, { v: '30', l: '30D' }, { v: '90', l: '90D' }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setTimeRange(v)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === v ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                <TrendingUp size={32} className="opacity-20 mr-3" /> No growth data yet
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <Clock size={16} className="text-gray-500" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm space-y-3">
                <Activity size={32} className="opacity-20" />
                <p>No recent activity</p>
              </div>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-dark-bg/30 border border-dark-border/50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getActionDot(item.action)}`}></div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">
                        {item.user ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || item.user.email : 'System'}
                      </span>{' '}
                      {getActionLabel(item.action)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
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
