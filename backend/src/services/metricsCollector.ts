import { SystemMetric } from '../models';
import os from 'os';

let serverStartTime = Date.now();
let requestCount = 0;
let totalResponseTime = 0;

export const trackRequest = (responseTimeMs: number) => {
  requestCount++;
  totalResponseTime += responseTimeMs;
};

export const getSystemHealth = () => {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
  const memUsage = process.memoryUsage();
  const cpuUsage = os.loadavg();

  return {
    uptime,
    uptimeFormatted: formatUptime(uptime),
    memoryUsage: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentUsed: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    cpu: {
      loadAvg1m: cpuUsage[0]?.toFixed(2) ?? '0',
      loadAvg5m: cpuUsage[1]?.toFixed(2) ?? '0',
      loadAvg15m: cpuUsage[2]?.toFixed(2) ?? '0',
      cores: os.cpus().length,
    },
    api: {
      totalRequests: requestCount,
      avgResponseTime: requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0,
    },
    system: {
      platform: os.platform(),
      nodeVersion: process.version,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
    },
  };
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
};

// Periodically record system metrics to DB
export const startMetricsCollector = (intervalMs: number = 60000) => {
  serverStartTime = Date.now();

  const collect = async () => {
    try {
      const health = getSystemHealth();
      await SystemMetric.bulkCreate([
        { metricName: 'cpu_load_1m', metricValue: parseFloat(health.cpu.loadAvg1m), timestamp: new Date() },
        { metricName: 'memory_percent', metricValue: health.memoryUsage.percentUsed, timestamp: new Date() },
        { metricName: 'heap_used_mb', metricValue: health.memoryUsage.heapUsed, timestamp: new Date() },
        { metricName: 'api_avg_response_ms', metricValue: health.api.avgResponseTime, timestamp: new Date() },
        { metricName: 'api_total_requests', metricValue: health.api.totalRequests, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error('Metrics collector error:', err);
    }
  };

  // Collect immediately then on interval
  collect();
  return setInterval(collect, intervalMs);
};
