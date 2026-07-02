import { SystemMetric, Notification, User, SystemSetting } from '../models';
import os from 'os';

let serverStartTime = Date.now();
let requestCount = 0;
let totalResponseTime = 0;

// Windows does not support os.loadavg(), so we calculate CPU usage manually
let currentCpuPercent = 0;
let lastCpus = os.cpus();

setInterval(() => {
  const cpus = os.cpus();
  let idleDifference = 0;
  let totalDifference = 0;
  
  for (let i = 0; i < cpus.length; i++) {
    const startObj = lastCpus[i].times;
    const endObj = cpus[i].times;
    const startTotal = Object.values(startObj).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
    const endTotal = Object.values(endObj).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
    totalDifference += (endTotal - startTotal);
    idleDifference += (endObj.idle - startObj.idle);
  }
  
  if (totalDifference > 0) {
    currentCpuPercent = (1 - (idleDifference / totalDifference)) * 100;
  }
  lastCpus = cpus;
}, 2000);

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
      heapPercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      systemPercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
    },
    cpu: {
      loadAvg1m: currentCpuPercent.toFixed(2),
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

// Default alert thresholds
const DEFAULT_THRESHOLDS = {
  memoryPercent: 90,
  cpuPercent: 90,
  apiResponseMs: 2000,
};

/**
 * Load alert thresholds from the database settings,
 * falling back to defaults if not configured.
 */
const getAlertThresholds = async () => {
  try {
    const settings = await SystemSetting.findAll({
      where: {
        key: ['alert_memory_percent', 'alert_cpu_percent', 'alert_api_response_ms'],
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s: any) => { map[s.key] = s.value; });

    return {
      memoryPercent: parseInt(map['alert_memory_percent']) || DEFAULT_THRESHOLDS.memoryPercent,
      cpuPercent: parseInt(map['alert_cpu_percent']) || DEFAULT_THRESHOLDS.cpuPercent,
      apiResponseMs: parseInt(map['alert_api_response_ms']) || DEFAULT_THRESHOLDS.apiResponseMs,
    };
  } catch {
    return DEFAULT_THRESHOLDS;
  }
};

/**
 * Check health against thresholds and emit alerts.
 */
const checkThresholds = async (health: ReturnType<typeof getSystemHealth>, socketSvc: any) => {
  if (!socketSvc) return;

  const thresholds = await getAlertThresholds();
  const alerts: { severity: string; message: string }[] = [];

  // System memory threshold
  if (health.memoryUsage.systemPercent > thresholds.memoryPercent) {
    alerts.push({
      severity: 'critical',
      message: `System memory usage at ${health.memoryUsage.systemPercent}% (threshold: ${thresholds.memoryPercent}%)`,
    });
  }

  // CPU threshold
  if (currentCpuPercent > thresholds.cpuPercent) {
    alerts.push({
      severity: 'high',
      message: `CPU usage at ${currentCpuPercent.toFixed(1)}% (threshold: ${thresholds.cpuPercent}%)`,
    });
  }

  // API response time threshold
  if (health.api.avgResponseTime > thresholds.apiResponseMs && health.api.totalRequests > 10) {
    alerts.push({
      severity: 'high',
      message: `Average API response time is ${health.api.avgResponseTime}ms (threshold: ${thresholds.apiResponseMs}ms)`,
    });
  }

  // Send alerts
  for (const alert of alerts) {
    socketSvc.emitSystemAlert({
      type: 'threshold',
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date(),
    });

    // Also create notification records for all admin users
    try {
      const admins = await User.findAll({ where: { role: 'Admin' }, attributes: ['id'] });
      const notifs = admins.map((admin: any) => ({
        userId: admin.id,
        title: `System Alert: ${alert.severity.toUpperCase()}`,
        message: alert.message,
        type: 'warning' as const,
      }));
      if (notifs.length > 0) {
        await Notification.bulkCreate(notifs);
      }
    } catch (err) {
      console.error('Failed to create alert notifications:', err);
    }
  }
};

// Periodically record system metrics to DB
export const startMetricsCollector = (intervalMs: number = 60000, socketSvc?: any) => {
  serverStartTime = Date.now();

  const collect = async () => {
    try {
      const health = getSystemHealth();
      const now = new Date();
      await SystemMetric.bulkCreate([
        { metricName: 'cpu_usage_percent', metricValue: parseFloat(health.cpu.loadAvg1m), timestamp: now },
        { metricName: 'system_memory_percent', metricValue: health.memoryUsage.systemPercent, timestamp: now },
        { metricName: 'heap_percent', metricValue: health.memoryUsage.heapPercent, timestamp: now },
        { metricName: 'heap_used_mb', metricValue: health.memoryUsage.heapUsed, timestamp: now },
        { metricName: 'api_avg_response_ms', metricValue: health.api.avgResponseTime, timestamp: now },
        { metricName: 'api_total_requests', metricValue: health.api.totalRequests, timestamp: now },
      ]);

      // Check thresholds and emit alerts
      await checkThresholds(health, socketSvc);
    } catch (err) {
      console.error('Metrics collector error:', err);
    }
  };

  // Collect immediately then on interval
  collect();
  return setInterval(collect, intervalMs);
};
