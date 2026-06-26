import { SystemMetric, Notification, User, SystemSetting } from '../models';
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

// Default alert thresholds
const DEFAULT_THRESHOLDS = {
  memoryPercent: 90,
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
        key: ['alert_memory_percent', 'alert_api_response_ms'],
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s: any) => { map[s.key] = s.value; });

    return {
      memoryPercent: parseInt(map['alert_memory_percent']) || DEFAULT_THRESHOLDS.memoryPercent,
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

  // Memory threshold
  if (health.memoryUsage.percentUsed > thresholds.memoryPercent) {
    alerts.push({
      severity: 'critical',
      message: `Memory usage at ${health.memoryUsage.percentUsed}% (threshold: ${thresholds.memoryPercent}%)`,
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
      await SystemMetric.bulkCreate([
        { metricName: 'cpu_load_1m', metricValue: parseFloat(health.cpu.loadAvg1m), timestamp: new Date() },
        { metricName: 'memory_percent', metricValue: health.memoryUsage.percentUsed, timestamp: new Date() },
        { metricName: 'heap_used_mb', metricValue: health.memoryUsage.heapUsed, timestamp: new Date() },
        { metricName: 'api_avg_response_ms', metricValue: health.api.avgResponseTime, timestamp: new Date() },
        { metricName: 'api_total_requests', metricValue: health.api.totalRequests, timestamp: new Date() },
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
