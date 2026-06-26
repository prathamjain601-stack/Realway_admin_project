import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Cpu, HardDrive, Clock, Zap, RefreshCw, Loader2, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemHealth {
  uptime: number;
  uptimeFormatted: string;
  memoryUsage: { rss: number; heapUsed: number; heapTotal: number; percentUsed: number };
  cpu: { loadAvg1m: string; loadAvg5m: string; cores: number };
  api: { totalRequests: number; avgResponseTime: number };
  system: { platform: string; nodeVersion: string; totalMemory: number; freeMemory: number };
}

const SystemMetricsView = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('memory_percent');
  const [timeRange, setTimeRange] = useState('24');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchData = async () => {
    try {
      let metricsQuery = `/metrics?name=${selectedMetric}&hours=${timeRange}`;
      if (timeRange === 'custom' && customStart && customEnd) {
        metricsQuery = `/metrics?name=${selectedMetric}&startDate=${customStart}&endDate=${customEnd}`;
      }

      const [healthRes, metricsRes] = await Promise.all([
        api.get('/metrics/system-health'),
        api.get(metricsQuery),
      ]);
      setHealth(healthRes.data);
      setMetricsHistory(
        metricsRes.data.reverse().map((m: any) => ({
          time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: m.metricValue,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch system metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedMetric, timeRange, customStart, customEnd]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const metricCards = [
    {
      icon: Clock,
      label: 'Uptime',
      value: health?.uptimeFormatted || '—',
      color: 'text-green-400',
      bgColor: 'bg-green-500',
    },
    {
      icon: HardDrive,
      label: 'Memory Usage',
      value: `${health?.memoryUsage.percentUsed || 0}%`,
      sub: `${health?.memoryUsage.heapUsed || 0}MB / ${health?.memoryUsage.heapTotal || 0}MB`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500',
    },
    {
      icon: Cpu,
      label: 'CPU Load (1m)',
      value: health?.cpu.loadAvg1m || '0',
      sub: `${health?.cpu.cores || 0} cores`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500',
    },
    {
      icon: Zap,
      label: 'Avg Response Time',
      value: `${health?.api.avgResponseTime || 0}ms`,
      sub: `${health?.api.totalRequests || 0} total requests`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500',
    },
  ];

  const timeRangeOptions = [
    { v: '6', l: '6h' },
    { v: '12', l: '12h' },
    { v: '24', l: '24h' },
    { v: '72', l: '3d' },
    { v: '168', l: '7d' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">System Metrics</h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${card.bgColor}`}></div>
            <div className="flex items-start justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">{card.label}</p>
              <card.icon size={20} className={card.color} />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
            {card.sub && <p className="text-xs text-gray-500 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-white">Metric History</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-dark-bg/50 rounded-lg p-1">
              {timeRangeOptions.map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => { setTimeRange(v); setShowDatePicker(false); }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === v ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {l}
                </button>
              ))}
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  timeRange === 'custom' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Calendar size={11} />
                Custom
              </button>
            </div>

            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="memory_percent">Memory %</option>
              <option value="cpu_load_1m">CPU Load</option>
              <option value="api_avg_response_ms">API Response Time</option>
              <option value="heap_used_mb">Heap Usage (MB)</option>
            </select>
          </div>
        </div>

        {showDatePicker && (
          <div className="flex items-end gap-3 mb-4 p-3 bg-dark-bg/50 rounded-lg border border-dark-border animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Start</label>
              <input
                type="datetime-local"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">End</label>
              <input
                type="datetime-local"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => {
                if (customStart && customEnd) {
                  setTimeRange('custom');
                  setShowDatePicker(false);
                }
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        )}

        <div className="h-72">
          {metricsHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              No metric data available yet. Data will populate after the metrics collector runs.
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Platform', value: health?.system.platform || '—' },
            { label: 'Node.js', value: health?.system.nodeVersion || '—' },
            { label: 'Total Memory', value: `${health?.system.totalMemory || 0} MB` },
            { label: 'Free Memory', value: `${health?.system.freeMemory || 0} MB` },
          ].map((item, i) => (
            <div key={i} className="bg-dark-bg/30 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-medium">{item.label}</p>
              <p className="text-sm text-white font-medium mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMetricsView;
