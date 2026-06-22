import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { User, Post, AuditLog, SystemMetric } from '../models';
import { getSystemHealth } from '../services/metricsCollector';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, newUsers24h, newUsers7d, newUsers30d, totalPosts, publishedPosts, draftPosts] =
      await Promise.all([
        User.count(),
        User.count({ where: { status: 'active' } }),
        User.count({ where: { createdAt: { [Op.gte]: oneDayAgo } } }),
        User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
        User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
        Post.count(),
        Post.count({ where: { status: 'published' } }),
        Post.count({ where: { status: 'draft' } }),
      ]);

    res.json({
      users: { total: totalUsers, active: activeUsers, new24h: newUsers24h, new7d: newUsers7d, new30d: newUsers30d },
      posts: { total: totalPosts, published: publishedPosts, drafts: draftPosts },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserGrowth = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const growth = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    res.json(growth);
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
    const hours = parseInt(req.query.hours as string) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const where: any = { timestamp: { [Op.gte]: since } };
    if (metricName) where.metricName = metricName;

    const metrics = await SystemMetric.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: 500,
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const exportMetrics = async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'json';
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const metrics = await SystemMetric.findAll({
      where: { timestamp: { [Op.gte]: since } },
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
    } else {
      res.json(metrics);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
