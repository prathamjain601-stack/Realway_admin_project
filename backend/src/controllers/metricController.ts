import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { User, Post, AuditLog, SystemMetric } from '../models';
import { getSystemHealth } from '../services/metricsCollector';
import { generateMetricsPDF } from '../services/pdfService';

/**
 * Parse optional startDate / endDate query params.
 * Falls back to a relative range (e.g. last N days) if not provided.
 */
const parseDateRange = (query: any, defaultDays: number) => {
  if (query.startDate && query.endDate) {
    return {
      start: new Date(query.startDate as string),
      end: new Date(query.endDate as string),
    };
  }
  if (query.startDate) {
    return {
      start: new Date(query.startDate as string),
      end: new Date(),
    };
  }
  const days = parseInt(query.days as string) || defaultDays;
  return {
    start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    end: new Date(),
  };
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req.query, 30);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, newUsers24h, newUsers7d, newUsers30d, totalPosts, publishedPosts, draftPosts, newUsersInRange] =
      await Promise.all([
        User.count(),
        User.count({ where: { status: 'active' } }),
        User.count({ where: { createdAt: { [Op.gte]: oneDayAgo } } }),
        User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
        User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
        Post.count(),
        Post.count({ where: { status: 'published' } }),
        Post.count({ where: { status: 'draft' } }),
        User.count({ where: { createdAt: { [Op.between]: [start, end] } } }),
      ]);

    res.json({
      users: { total: totalUsers, active: activeUsers, new24h: newUsers24h, new7d: newUsers7d, new30d: newUsers30d, newInRange: newUsersInRange },
      posts: { total: totalPosts, published: publishedPosts, drafts: draftPosts },
      dateRange: { start: start.toISOString(), end: end.toISOString() },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserGrowth = async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req.query, 30);

    // --- 1. Build a continuous array of dates for the entire range ---
    const dates: string[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    while (cursor <= endDate) {
      dates.push(cursor.toISOString().split('T')[0]); // "YYYY-MM-DD"
      cursor.setDate(cursor.getDate() + 1);
    }

    // --- 2. Get daily new signups (GROUP BY date) ---
    const dailySignups = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.between]: [start, endDate] },
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    // Build a lookup map: "YYYY-MM-DD" -> daily count
    const signupMap = new Map<string, number>();
    (dailySignups as any[]).forEach((row) => {
      signupMap.set(row.date, parseInt(row.count, 10));
    });

    // --- 3. Count users created BEFORE the range start (baseline) ---
    const baselineCount = await User.count({
      where: { createdAt: { [Op.lt]: start } },
    });

    // --- 4. Assemble the final array with cumulative totals ---
    let cumulative = baselineCount;
    const result = dates.map((date) => {
      const dailyNew = signupMap.get(date) || 0;
      cumulative += dailyNew;
      return {
        date,            // ISO date string "YYYY-MM-DD"
        count: dailyNew, // new signups this day
        total: cumulative, // cumulative total users up to & including this day
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSystemHealthEndpoint = async (req: Request, res: Response) => {
  try {
    const health = getSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const activity = await AuditLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
      limit,
    });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const metricName = req.query.name as string;

    // Support both hours-based and custom date range
    let since: Date;
    let until: Date = new Date();

    if (req.query.startDate) {
      since = new Date(req.query.startDate as string);
      if (req.query.endDate) until = new Date(req.query.endDate as string);
    } else {
      const hours = parseInt(req.query.hours as string) || 24;
      since = new Date(Date.now() - hours * 60 * 60 * 1000);
    }

    const where: any = { timestamp: { [Op.between]: [since, until] } };
    if (metricName) where.metricName = metricName;

    // Calculate time span in hours to decide aggregation strategy
    const spanHours = (until.getTime() - since.getTime()) / (1000 * 60 * 60);

    if (spanHours > 12) {
      // For large ranges, aggregate into hourly buckets using AVG
      // This ensures 3d = ~72 points, 7d = ~168 points (manageable)
      const replacements: any = { since, until };
      let nameClause = '';
      if (metricName) {
        nameClause = 'AND "metricName" = :metricName';
        replacements.metricName = metricName;
      }

      const metrics = await SystemMetric.sequelize!.query(
        `SELECT
          date_trunc('hour', "timestamp") AS "timestamp",
          ROUND(AVG("metricValue")::numeric, 2) AS "metricValue",
          "metricName"
        FROM "system_metrics"
        WHERE "timestamp" BETWEEN :since AND :until ${nameClause}
        GROUP BY date_trunc('hour', "timestamp"), "metricName"
        ORDER BY date_trunc('hour', "timestamp") ASC`,
        {
          replacements,
          type: 'SELECT' as any,
        }
      );
      res.json(metrics);
    } else {
      // For short ranges (≤12h), return raw data points
      const metrics = await SystemMetric.findAll({
        where,
        order: [['timestamp', 'ASC']],
        raw: true,
      });
      res.json(metrics);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const exportMetrics = async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'json';
    const { start, end } = parseDateRange(req.query, 30);

    const metrics = await SystemMetric.findAll({
      where: { timestamp: { [Op.between]: [start, end] } },
      order: [['timestamp', 'ASC']],
      raw: true,
    });

    if (format === 'csv') {
      const csvHeader = 'id,metricName,metricValue,timestamp\n';
      const csvRows = metrics.map((m: any) =>
        `${m.id},"${m.metricName}",${m.metricValue},"${m.timestamp}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=metrics-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvRows);
    } else if (format === 'pdf') {
      // Gather dashboard and health data for the PDF report
      const [dashboardData, systemHealth] = await Promise.all([
        (async () => {
          const [total, active, new24h, new7d, new30d, totalPosts, published, drafts] = await Promise.all([
            User.count(),
            User.count({ where: { status: 'active' } }),
            User.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 86400000) } } }),
            User.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 604800000) } } }),
            User.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 2592000000) } } }),
            Post.count(),
            Post.count({ where: { status: 'published' } }),
            Post.count({ where: { status: 'draft' } }),
          ]);
          return { users: { total, active, new24h, new7d, new30d }, posts: { total: totalPosts, published, drafts } };
        })(),
        getSystemHealth(),
      ]);

      const pdfBuffer = await generateMetricsPDF(metrics as any[], dashboardData, systemHealth);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=metrics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      res.send(pdfBuffer);
    } else {
      res.json(metrics);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
